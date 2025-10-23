import { ZodError } from 'zod';

export const zodValidate = (schema, source = 'body') => {
	return (req, res, next) => {
		try {
			if (source === 'body') schema.parse(req.body);
			else if (source === 'params') schema.parse(req.params);
			else if (source === 'query') schema.parse(req.query);
			else schema.parse(req[source] ?? {});
			return next();
		} catch (err) {
			if (err instanceof ZodError) {
				const fieldErrors = {};
				for (const issue of err.issues) {
					const key = issue.path.join('.') || 'global';
					if (!fieldErrors[key]) fieldErrors[key] = [];
					fieldErrors[key].push(issue.message);
				}
				return res.status(400).json({
					success: false,
					message: 'Validación fallida',
					errors: fieldErrors
				});
			}
			return next(err);
		}
	};
};

