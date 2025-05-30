import pool from '../config/database.js';

export const login = async (correo, password) => {
  try {
    const query = 'SELECT * FROM users WHERE correo = $1 AND password = $2';
    const result = await pool.query(query, [correo, password]);
    
    if (result.rows.length === 0) {
      return { success: false, message: 'Credenciales inválidas' };
    }
    
    return { success: true, user: result.rows[0] };
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const checkEmailExists = async (correo) => {
  try {
    const query = 'SELECT * FROM users WHERE correo = $1';
    const result = await pool.query(query, [correo]);
    
    return { exists: result.rows.length > 0 };
  } catch (error) {
    console.error('Error al verificar email:', error);
    throw error;
  }
}; 