// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.OTP.Types
{
	/// <summary>
	/// The type of one time password
	/// </summary>
	public enum OtpType
	{
		/// <summary>
		/// Unknown
		/// </summary>
		Unknown,
		/// <summary>
		/// HOTP
		/// </summary>
		Hotp,
		/// <summary>
		/// TOTP
		/// </summary>
		Totp
	}
}

