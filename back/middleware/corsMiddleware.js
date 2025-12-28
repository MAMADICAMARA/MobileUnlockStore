// back/middleware/corsMiddleware.js
module.exports = (req, res, next) => {
	// Autoriser l'origine du client (définir CLIENT_ORIGIN dans .env ou laisser la valeur par défaut)
	const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5174';
	res.header('Access-Control-Allow-Origin', allowedOrigin);
	res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	res.header('Access-Control-Allow-Credentials', 'true');

	// Répondre aux pré-vols OPTIONS rapidement
	if (req.method === 'OPTIONS') {
		return res.sendStatus(204);
	}
	next();
};