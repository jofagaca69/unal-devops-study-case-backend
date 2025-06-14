import pool from "../config/database.js";
import bcrypt from "bcrypt";

const MAX_LOGIN_ATTEMPTS = 3;
const ACCOUNT_LOCK_TIME_MINUTES = 5;

export const login = async (correo, password) => {
  const client = await pool.connect();
  ///////
  try {
    const authQuery = "SELECT * FROM auth WHERE username = $1";
    const authResult = await client.query(authQuery, [correo]);

    if (authResult.rows.length === 0) {
      return { success: false, message: "Credenciales inválidas" };
    }

    const authData = authResult.rows[0];

    if (authData.locked) {
      return {
        success: false,
        message: "Cuenta bloqueada, contactar a soporte.",
      };
    }

    if (authData.login_attempts >= MAX_LOGIN_ATTEMPTS) {
      const lastAttemptTime = new Date(authData.last_attempt);
      const currentTime = new Date();
      const minutesSinceLastAttempt =
        (currentTime.getTime() - lastAttemptTime.getTime()) / (1000 * 60);

      if (minutesSinceLastAttempt < ACCOUNT_LOCK_TIME_MINUTES) {
        return {
          success: false,
          message: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${Math.ceil(
            ACCOUNT_LOCK_TIME_MINUTES - minutesSinceLastAttempt
          )} minutos.`,
        };
      } else {
        await client.query(
          "UPDATE auth SET login_attempts = 0, last_attempt = NULL WHERE user_id = $1",
          [authData.user_id]
        );
      }
    }

    const passwordMatch = await bcrypt.compare(password, authData.password);

    if (!passwordMatch) {
      await client.query(
        "UPDATE auth SET login_attempts = login_attempts + 1, last_attempt = CURRENT_TIMESTAMP WHERE user_id = $1",
        [authData.user_id]
      );

      const updatedAuthQuery =
        "SELECT login_attempts FROM auth WHERE user_id = $1";
      const updatedAuthResult = await client.query(updatedAuthQuery, [
        authData.user_id,
      ]);
      const currentAttempts = updatedAuthResult.rows[0].login_attempts;

      if (currentAttempts >= MAX_LOGIN_ATTEMPTS) {
        await client.query("UPDATE auth SET locked = TRUE WHERE user_id = $1", [
          authData.user_id,
        ]);
        return {
          success: false,
          message:
            "Demasiados intentos fallidos. Cuenta bloqueada. Contactar a soporte.",
        };
      }

      return {
        success: false,
        message: `Contraseña inválida. Intentos restantes: ${
          MAX_LOGIN_ATTEMPTS - currentAttempts
        }`,
      };
    }

    await client.query(
      "UPDATE auth SET login_attempts = 0, last_attempt = NULL WHERE user_id = $1",
      [authData.user_id]
    );

    const userQuery = "SELECT * FROM users WHERE id = $1";
    const userResult = await client.query(userQuery, [authData.user_id]);

    return { success: true, user: userResult.rows[0] };
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const register = async ({
  email,
  first_name,
  last_name,
  phone,
  birth_date,
  password,
}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const checkEmailQuery = "SELECT id FROM users WHERE email = $1";
    const checkEmailResult = await client.query(checkEmailQuery, [email]);

    if (checkEmailResult.rows.length > 0) {
      throw new Error(
        "Cuenta ya existente con este correo electrónico proporcionado."
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertUserQuery = `
      INSERT INTO users (email, first_name, last_name, phone, birth_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `

    const insertAuthQuery = `
      INSERT INTO auth (user_id, username, password)
      VALUES ($1, $2, $3);
    `;

    const userResult = await client.query(insertUserQuery, [
      email,
      first_name,
      last_name,
      phone,
      birth_date,
    ]);

    const userId = userResult.rows[0].id;

    await client.query(insertAuthQuery, [userId, email, password]);

    await client.query("COMMIT");

    return { success: true, userId };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en registro:", error);
    throw error;
  } finally {
    client.release();
  }
};