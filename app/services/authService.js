import pool from '../config/database.js';

export const login = async (email, password) => {
  try {
    const query = 'SELECT * FROM users WHERE email = $1 AND password = $2';
    const result = await pool.query(query, [email, password]);
    
    if (result.rows.length === 0) {
      return { success: false, message: 'Credenciales inválidas' };
    }
    
    return { success: true, user: result.rows[0] };
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const checkEmailExists = async (email) => {
  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    
    return { exists: result.rows.length > 0 };
  } catch (error) {
    console.error('Error al verificar email:', error);
    throw error;
  }
}; 