// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.OTP.Types
{
	/// <summary>
	/// Indicates which HMAC hashing algorithm should be used
	/// </summary>
	public enum OtpHashMode
	{
		/// <summary>
		/// Sha1 is used as the HMAC hashing algorithm
		/// </summary>
		Sha1,
		/// <summary>
		/// Sha256 is used as the HMAC hashing algorithm
		/// </summary>
		Sha256,
		/// <summary>
		/// Sha512 is used as the HMAC hashing algorithm
		/// </summary>
		Sha512
	}
}

