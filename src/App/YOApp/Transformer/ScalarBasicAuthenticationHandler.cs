// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;

namespace YOApp
{
    public sealed class ScalarBasicAuthenticationHandler: AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public const string SchemeName = "ScalarBasic";
        private readonly IConfiguration _configuration;

        public ScalarBasicAuthenticationHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,ILoggerFactory logger,UrlEncoder encoder,IConfiguration configuration): base(options, logger, encoder)
        {
            _configuration = configuration;
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (!Request.Headers.TryGetValue("Authorization", out var value))
            {
                return Task.FromResult(
                    AuthenticateResult.NoResult());
            }

            if (!AuthenticationHeaderValue.TryParse(
                    value.ToString(),
                    out var authorizationHeader) ||
                !string.Equals(
                    authorizationHeader.Scheme,
                    "Basic",
                    StringComparison.OrdinalIgnoreCase) ||
                string.IsNullOrWhiteSpace(authorizationHeader.Parameter))
            {
                return Task.FromResult(
                    AuthenticateResult.Fail("Invalid authorization header."));
            }

            string decodedCredentials;

            try
            {
                var credentialBytes = Convert.FromBase64String(
                    authorizationHeader.Parameter);

                decodedCredentials = Encoding.UTF8.GetString(
                    credentialBytes);
            }
            catch (FormatException)
            {
                return Task.FromResult(
                    AuthenticateResult.Fail("Invalid Basic credentials."));
            }

            var separatorIndex = decodedCredentials.IndexOf(':');

            if (separatorIndex <= 0)
            {
                return Task.FromResult(
                    AuthenticateResult.Fail("Invalid Basic credentials."));
            }

            var suppliedUsername =
                decodedCredentials[..separatorIndex];

            var suppliedPassword =
                decodedCredentials[(separatorIndex + 1)..];

            var expectedUsername =
                _configuration["ScalarDocs:Username"];

            var expectedPassword =
                _configuration["ScalarDocs:Password"];

            if (string.IsNullOrWhiteSpace(expectedUsername) ||
                string.IsNullOrWhiteSpace(expectedPassword))
            {
                return Task.FromResult(
                    AuthenticateResult.Fail(
                        "Scalar documentation credentials are not configured."));
            }

            if (!SecureEquals(suppliedUsername, expectedUsername) ||
                !SecureEquals(suppliedPassword, expectedPassword))
            {
                return Task.FromResult(
                    AuthenticateResult.Fail("Invalid username or password."));
            }

            var claims = new[]
            {
            new Claim(
                ClaimTypes.NameIdentifier,
                suppliedUsername),

            new Claim(
                ClaimTypes.Name,
                suppliedUsername),

            new Claim(
                ClaimTypes.Role,
                "ScalarDocs")
        };

            var identity = new ClaimsIdentity(
                claims,
                SchemeName);

            var principal = new ClaimsPrincipal(identity);

            var ticket = new AuthenticationTicket(
                principal,
                SchemeName);

            return Task.FromResult(
                AuthenticateResult.Success(ticket));
        }

        protected override Task HandleChallengeAsync(
            AuthenticationProperties properties)
        {
            Response.Headers.WWWAuthenticate =
                """Basic realm="Scalar API Documentation", charset="UTF-8" """;

            Response.StatusCode =
                StatusCodes.Status401Unauthorized;

            return Task.CompletedTask;
        }

        private static bool SecureEquals(
            string suppliedValue,
            string expectedValue)
        {
            var suppliedBytes =
                Encoding.UTF8.GetBytes(suppliedValue);

            var expectedBytes =
                Encoding.UTF8.GetBytes(expectedValue);

            return suppliedBytes.Length == expectedBytes.Length &&
                   CryptographicOperations.FixedTimeEquals(
                       suppliedBytes,
                       expectedBytes);
        }
    }
}
