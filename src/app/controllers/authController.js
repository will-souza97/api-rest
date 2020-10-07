const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../../modules/mailer");

const authConfig = require("../../config/auth.json");

const User = require("../models/user");

const router = express.Router();

function generateToken(params = {}) {
	return jwt.sign(params, authConfig.secret, {
		expiresIn: 86400,
	});
}
// Criando Rota de Registro
router.post("/register", async (req, res) => {
	const { email } = req.body;
	try {
		if (await User.findOne({ email }))
			return res.status(400).send({ erro: "Usuario já existente" });

		const user = await User.create(req.body);

		// Removendo Password da Requisição quando for feito o login
		user.password = undefined;

		return res.send({
			user,
			token: generateToken({ id: user.id }),
		});
	} catch (err) {
		return res.status(400).send({ error: "Registration Failed" });
	}
});

// Criando Rota de Autenticação
router.post("/authenticate", async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email }).select("+password");

	if (!user) return res.status(400).send({ error: "Usuario não existe" });

	// Fazendo Autenticação de senha com o Banco de Dados
	if (!(await bcrypt.compare(password, user.password)))
		return res.status(400).send({ error: "Senha Invalida" });

	// Removendo Password da Requisição quando for feito o login
	user.password = undefined;

	res.send({
		user,
		token: generateToken({ id: user.id }),
	});
});

// Criando Rota de Recuperação de Senha
router.post("/forgot_password", async (req, res) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user) return res.status(400).send({ error: "Usuario não existe" });

		const token = crypto.randomBytes(20).toString("hex");

		const now = new Date();
		now.setHours(now.getHours() + 1);

		await User.findOneAndUpdate(user.id, {
			$set: {
				passwordResetToken: token,
				passwordResetExpires: now,
			},
		});

		mailer.sendMail(
			{
				from: "rzy.x97@gmail.com",
				to: "weuller.santos.ws@gmail.com",
				template: "auth/forgot_password",
				context: { token },
			},
			(err) => {
				if (err)
					return res
						.status(400)
						.send({ error: "Não foi possivel recuperar a senha" });

				return res.status(200).send("OK");
			}
		);
	} catch (err) {
		res
			.status(400)
			.send({ error: "Erro na recuperação da senha, tente novamente" });
	}
});

// Criando Rota de Resetar uma Senha
router.post("/reset_password", async (req, res) => {
	const { email, token, password } = req.body;

	try {
		const user = await User.findOne({ email }).select(
			"+passwordResetToken passwordResetExpires"
		);

		if (!user) return res.status(400).send({ error: "Usuario não existe" });

		if (token !== user.passwordResetToken)
			return res.status(400).send({ error: "Token Invalidado" });

		const now = new Date();

		if (now > user.passwordResetExpires)
			return res
				.status(400)
				.send({ error: "Token expirou. Porfavor gere um novo" });

		user.password = password;

		await user.save();
		res.send();
	} catch (err) {
		res.status(400).send({ error: "Não foi possivel resetar a senha" });
	}
});

module.exports = (app) => app.use("/auth", router);
