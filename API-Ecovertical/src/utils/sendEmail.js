import nodemailer from 'nodemailer';

// Configuración del transporter (usando Gmail como ejemplo)
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER y EMAIL_PASS deben estar configurados en las variables de entorno');
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Función principal para enviar emails (usada por el controlador de auth)
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email enviado a: ${to}`);
    
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error('Error al enviar el email');
  }
};

// Email de verificación
export const sendVerificationEmail = async (email, nombre, token) => {
  try {
    const transporter = createTransporter();
    
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verifica tu email - EcoVertical',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2ecc71;">¡Bienvenido a EcoVertical, ${nombre}!</h2>
          <p>Gracias por registrarte en nuestra plataforma de huertos verticales.</p>
          <p>Para completar tu registro, por favor verifica tu dirección de email haciendo clic en el siguiente enlace:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #2ecc71; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verificar Email
            </a>
          </p>
          <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #666;">${verificationLink}</p>
          <p>Este enlace expirará en 24 horas.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            Si no solicitaste este registro, por favor ignora este email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de verificación enviado a: ${email}`);
    
  } catch (error) {
    console.error('Error enviando email de verificación:', error);
    throw new Error('Error al enviar el email de verificación');
  }
};

// Email de recuperación de contraseña
export const sendPasswordResetEmail = async (email, nombre, token) => {
  try {
    const transporter = createTransporter();
    
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recupera tu contraseña - EcoVertical',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">Recuperación de contraseña</h2>
          <p>Hola ${nombre},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #e74c3c; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Restablecer Contraseña
            </a>
          </p>
          <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #666;">${resetLink}</p>
          <p>Este enlace expirará en 1 hora por seguridad.</p>
          <p style="color: #999; font-size: 12px;">
            Si no solicitaste este cambio, por favor ignora este email y tu contraseña permanecerá igual.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">
            Por seguridad, te recomendamos cambiar tu contraseña regularmente.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de recuperación enviado a: ${email}`);
    
  } catch (error) {
    console.error('Error enviando email de recuperación:', error);
    throw new Error('Error al enviar el email de recuperación');
  }
};

// Email de bienvenida (opcional)
export const sendWelcomeEmail = async (email, nombre) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '¡Bienvenido a EcoVertical!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2ecc71;">¡Felicitaciones, ${nombre}!</h2>
          <p>Tu cuenta en EcoVertical ha sido verificada exitosamente.</p>
          <p>Ahora puedes disfrutar de todas las funcionalidades de nuestra plataforma:</p>
          <ul>
            <li>Gestionar tus huertos verticales</li>
            <li>Registrar cosechas y riegos</li>
            <li>Recibir alertas personalizadas</li>
            <li>Conectar con otros agricultores urbanos</li>
          </ul>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background-color: #2ecc71; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Ir al Dashboard
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            ¡Gracias por unirte a la comunidad de agricultura urbana!
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de bienvenida enviado a: ${email}`);
    
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
    // No lanzamos error porque no es crítico
  }
};

// Email de código de verificación para restablecimiento de contraseña
export const sendPasswordResetCodeEmail = async (email, nombre, code) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Código de verificación - Restablecer contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2ecc71, #27ae60); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">EcoVertical</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Restablecimiento de contraseña</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #2c3e50; margin-top: 0;">Hola ${nombre},</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Recibimos una solicitud para restablecer tu contraseña en EcoVertical.
            </p>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Utiliza el siguiente código de verificación para continuar:
            </p>
            
            <div style="background: white; border: 2px solid #2ecc71; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
              <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Tu código de verificación es:</p>
              <div style="font-size: 32px; font-weight: bold; color: #2ecc71; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⚠️ Importante:</strong> Este código expira en 10 minutos por seguridad.
              </p>
            </div>
            
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              Si no solicitaste este cambio, puedes ignorar este email de forma segura. 
              Tu contraseña no será modificada.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; background: #ecf0f1; border-radius: 10px;">
            <p style="color: #7f8c8d; margin: 0; font-size: 12px;">
              Este email fue enviado desde EcoVertical - Plataforma de Gestión de Huertos Verticales
            </p>
            <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 12px;">
              © 2024 EcoVertical. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de código de restablecimiento enviado a: ${email}`);
    
  } catch (error) {
    console.error('Error enviando email de código de restablecimiento:', error);
    throw new Error('Error al enviar el email de código de verificación');
  }
};