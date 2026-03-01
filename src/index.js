export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, X-Username, X-Password',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		const user = request.headers.get('X-Username');
		const pass = request.headers.get('X-Password');

		if (!user || !pass) return new Response('Missing Credentials', { status: 401, headers: corsHeaders });

		// 1. Auth Check: Find or Create User
		let dbUser = await env.DB.prepare('SELECT password FROM users WHERE username = ?').bind(user).first();

		if (!dbUser) {
			// Register new user
			await env.DB.prepare('INSERT INTO users (username, password) VALUES (?, ?)').bind(user, pass).run();
		} else if (dbUser.password !== pass) {
			return new Response('Invalid Password', { status: 403, headers: corsHeaders });
		}

		// 2. Handle GET (Fetch Transactions)
		if (url.pathname === '/transactions' && request.method === 'GET') {
			const { results } = await env.DB.prepare('SELECT * FROM transactions WHERE username = ? ORDER BY date DESC').bind(user).all();
			return Response.json(results, { headers: corsHeaders });
		}

		// 3. Handle POST (Add Transaction)
		if (url.pathname === '/transactions' && request.method === 'POST') {
			const { type, amount, item } = await request.json();
			await env.DB.prepare('INSERT INTO transactions (username, type, amount, item, date) VALUES (?, ?, ?, ?, ?)')
				.bind(user, type, amount, item, new Date().toISOString())
				.run();
			return new Response('Saved', { status: 201, headers: corsHeaders });
		}

		return new Response('Not Found', { status: 404, headers: corsHeaders });
	},
};
