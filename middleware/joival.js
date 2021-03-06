const  Joi      =  require("@hapi/joi");

module.exports = {
	validateBody: (schema) => {
		return (req, res, next) => {
			const result = schema.validate();
			if(result.error){
				return res.status(400).json(result.error);
			}
			if(!req.value){
				req.value = {};
			}
			req.value['body'] = result.value;
			next();
		};
	},

	schemas: {
		authSchema: Joi.object().keys({
		"email": Joi.string().trim().email().required(),
		"firstName": Joi.string().required(),
		"lastName": Joi.string(),
		"password": Joi.string().min(5).max(10).required()
		}) 
	}
};

	