CREATE OR ALTER FUNCTION [dbo].[udf_Split]
(
	@String [NVARCHAR](MAX)  
	,@Delimiter [CHAR](1)  
)
RETURNS @temptable TABLE ([items] [NVARCHAR](MAX))  
AS
BEGIN
	IF LEN(ISNULL(@String,'')) < 1  
		RETURN  
   
	IF (SUBSTRING(@String, LEN(@String), LEN(@String)) = @Delimiter)  
		SELECT @String = SUBSTRING(@String, 1, LEN(@String) - 1)   
       
		DECLARE @xml  XML  
  
		SET @xml = CAST(('<Node>' + REPLACE(@String, @Delimiter, '</Node><Node>') + '</Node>') AS XML)  
  
		INSERT INTO @temptable  
		SELECT N.value('.', 'NVARCHAR(MAX)') AS items  
		FROM @xml.nodes('Node') AS T(N)   
   
	RETURN  

END