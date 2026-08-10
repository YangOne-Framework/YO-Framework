using System.Data.Common;
using Dapper;
using Microsoft.Extensions.Hosting;
using YangOne.Data;
using YangOne.Log;

namespace YangOne.Web;

/// <summary>
/// Scheduled theme activation worker (blueprint §86).
///
/// Every minute:
///   - schedules whose start time arrived (and window still open) become active:
///     the linked assignment is enabled, or — when no assignment is linked — the
///     theme becomes the globally active theme (legacy switch).
///   - active schedules whose end time passed complete: the linked assignment is
///     disabled again so resolution falls back to the default theme.
///
/// All transitions write audit entries and invalidate the public page cache.
/// The worker is defensive: if the studio migration has not been applied yet it
/// backs off instead of crashing the host.
/// </summary>
public class YOThemeSchedulerWorker : BackgroundService
{
    private readonly ILogger _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);
    private static readonly TimeSpan Backoff = TimeSpan.FromMinutes(10);
    private bool _schemaMissing;

    public YOThemeSchedulerWorker(ILogger logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (!_schemaMissing)
                    await ProcessSchedulesAsync();
                await Task.Delay(_schemaMissing ? Backoff : Interval, stoppingToken);
            }
            catch (TaskCanceledException)
            {
                return;
            }
            catch (Exception ex)
            {
                _logger?.Log(LogType.Error, () => $"YOThemeSchedulerWorker cycle failed: {ex.Message}", ex);
                try
                {
                    await Task.Delay(Interval, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    return;
                }
            }
        }
    }

    private async Task ProcessSchedulesAsync()
    {
        try
        {
            var now = DateTime.UtcNow;
            var dbFactory = DbFactoryProvider.GetFactory();
            using var db = (DbConnection)dbFactory.GetConnection();
            await db.OpenAsync();

            /* ── 1. Activate due schedules ── */
            var due = (await db.QueryAsync<YOThemeScheduleEntry>(
                @"SELECT s.*, t.YOThemeUniqueId, t.Name AS ThemeName
                  FROM dbo.YOThemeSchedule s
                  INNER JOIN dbo.YOTheme t ON t.YOThemeId = s.YOThemeId
                  WHERE s.Status = 'scheduled'
                    AND s.StartDate <= @Now
                    AND (s.EndDate IS NULL OR s.EndDate > @Now)
                    AND t.IsDeleted = 0 AND t.IsPublished = 1 AND t.Status = 'published'",
                new { Now = now })).AsList();

            foreach (var schedule in due)
            {
                if (schedule.ThemeAssignmentId.HasValue)
                {
                    await db.ExecuteAsync(
                        @"UPDATE dbo.YOThemeAssignment
                          SET IsActive = 1, UpdatedOn = GETDATE()
                          WHERE ThemeAssignmentId = @Id",
                        new { Id = schedule.ThemeAssignmentId.Value });
                }
                else
                {
                    /* Unlinked schedule = global activation (legacy switch) */
                    var themeGuid = await db.ExecuteScalarAsync<string>(
                        "SELECT YOThemeUniqueId FROM dbo.YOTheme WHERE YOThemeId = @Id",
                        new { Id = schedule.YOThemeId });
                    await db.ExecuteAsync(
                        "usp_YOTheme_Activate",
                        new { YOThemeUniqueId = themeGuid, UpdatedBy = 0 },
                        commandType: System.Data.CommandType.StoredProcedure);
                }

                await MarkAsync(db, schedule.ThemeScheduleId, "active", schedule.YOThemeId, "schedule.activated",
                    $"Theme \"{schedule.ThemeName}\" activated by schedule");
            }

            /* ── 2. Complete expired schedules ── */
            var expired = (await db.QueryAsync<YOThemeScheduleEntry>(
                @"SELECT s.*, t.YOThemeUniqueId, t.Name AS ThemeName
                  FROM dbo.YOThemeSchedule s
                  INNER JOIN dbo.YOTheme t ON t.YOThemeId = s.YOThemeId
                  WHERE s.Status = 'active'
                    AND s.EndDate IS NOT NULL
                    AND s.EndDate <= @Now",
                new { Now = now })).AsList();

            foreach (var schedule in expired)
            {
                if (schedule.ThemeAssignmentId.HasValue)
                {
                    await db.ExecuteAsync(
                        @"UPDATE dbo.YOThemeAssignment
                          SET IsActive = 0, UpdatedOn = GETDATE()
                          WHERE ThemeAssignmentId = @Id",
                        new { Id = schedule.ThemeAssignmentId.Value });
                }

                await MarkAsync(db, schedule.ThemeScheduleId, "completed", schedule.YOThemeId, "schedule.completed",
                    $"Theme \"{schedule.ThemeName}\" schedule window ended");
            }

            if (due.Count > 0 || expired.Count > 0)
            {
                PublicPageCache.InvalidatePage();
                PublicPageCache.InvalidateTheme();
            }
        }
        catch (Exception ex) when (IsMissingSchema(ex))
        {
            /* Studio migration not applied yet — back off quietly */
            _schemaMissing = true;
        }
    }

    private static async Task MarkAsync(
        DbConnection db, long scheduleId, string status, long themeId, string auditAction, string remarks)
    {
        await db.ExecuteAsync(
            "UPDATE dbo.YOThemeSchedule SET Status = @Status WHERE ThemeScheduleId = @Id",
            new { Status = status, Id = scheduleId });

        await db.ExecuteAsync(
            "usp_YOThemeAudit_Log",
            new
            {
                YOThemeId = (int)themeId,
                Action = auditAction,
                Section = "scheduling",
                PropertyPath = (string)null,
                OldValue = (string)null,
                NewValue = status,
                PerformedBy = 0,
                IPAddress = (string)null,
                Remarks = remarks
            },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    private static bool IsMissingSchema(Exception ex) =>
        ex.Message.Contains("Invalid object name 'dbo.YOThemeSchedule'")
        || ex.Message.Contains("Invalid object name 'dbo.YOThemeAuditLog'")
        || ex.Message.Contains("Could not find stored procedure 'dbo.usp_YOThemeAudit_Log'");
}
