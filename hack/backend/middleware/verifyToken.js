import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
	const token = req.cookies.token;
	if (!token) return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });

		req.userId = decoded.userId;
		req.userRole = decoded.role;
		next();
	} catch (error) {
		// Likely an invalid/expired token or bad JWT secret. Treat as Unauthorized, not Server Error.
		console.error("verifyToken: JWT verification failed", error?.message || error);
		// Clear potentially invalid cookie so subsequent requests don't keep failing
		try {
			res.clearCookie("token", {
				httpOnly: true,
				sameSite: "strict",
				secure: process.env.NODE_ENV === "production",
			});
		} catch (_) { /* noop */ }
		return res.status(401).json({ success: false, message: "Unauthorized - invalid or expired token" });
	}
};
