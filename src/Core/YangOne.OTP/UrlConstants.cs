// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.OTP
{
	/// <summary>
	/// Several constants used for the URL format
	/// </summary>
	internal class UrlConstants
	{
		public const string SecretParameter = "secret";
		public const string AlgorithmParameter = "algorithm";
		public const string PeriodParameter = "period";
		public const string CounterParameter = "counter";
		public const string DigitsParameter = "digits";
		public const string ParameterCreation = "&{0}={1}";
		public const string UrlValidationPatterm = @"^[^:]+://[^/]+/[^/\?]+(/?\?[^/]+)?$";
	}
}

