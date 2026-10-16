export const ROLES = {
  ADMIN: 'Administrador',
  MESERO: 'Mesero',
  CAJERO: 'Cajero'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    label: 'Administrador',
    description: 'Acceso total a todo: Inicio, Ingredientes, Platos, Proveedores, Pedidos, Compras, Ingresos/Egresos y Reportes completos.',
    badgeClass: 'role-badge-admin',
    color: '#D9532F',
    iconName: 'ShieldCheck',
    allowedTabs: ['dash', 'ing', 'plat', 'prov', 'ped', 'comp', 'fin', 'rep'],
    defaultTab: 'dash',
    canEditIng: true,
    canEditPlat: true,
    salesOnlyReports: false
  },
  [ROLES.MESERO]: {
    label: 'Mesero',
    description: 'Módulos de salón: Inicio, Pedidos (crear y ver) y Platos (solo ver, sin crear ni eliminar).',
    badgeClass: 'role-badge-mesero',
    color: '#0F6B6F',
    iconName: 'Utensils',
    allowedTabs: ['dash', 'ped', 'plat'],
    defaultTab: 'ped',
    canEditIng: false,
    canEditPlat: false, // Solo ver, sin crear, editar ni eliminar
    salesOnlyReports: false
  },
  [ROLES.CAJERO]: {
    label: 'Cajero',
    description: 'Módulos de caja: Inicio, Pedidos (crear y ver), Ingresos y egresos, Reportes (solo ventas), Ingredientes y Platos (solo ver).',
    badgeClass: 'role-badge-cajero',
    color: '#D69715',
    iconName: 'WalletCards',
    allowedTabs: ['dash', 'ing', 'plat', 'ped', 'fin', 'rep'],
    defaultTab: 'ped',
    canEditIng: false, // Solo ver, sin editar
    canEditPlat: false, // Solo ver, sin editar
    salesOnlyReports: true // Solo reportes de ventas
  }
};

export const TEST_USERS = [
  {
    id: 'usr-admin',
    username: 'admin',
    password: '123',
    name: 'Carlos Morales',
    role: ROLES.ADMIN,
    avatar: '👨‍💼',
    shift: 'Turno Completo'
  },
  {
    id: 'usr-mesero',
    username: 'mesero',
    password: '123',
    name: 'Lucía Mamani',
    role: ROLES.MESERO,
    avatar: '👩‍🍳',
    shift: 'Turno Tarde'
  },
  {
    id: 'usr-cajero',
    username: 'cajero',
    password: '123',
    name: 'Mateo Quispe',
    role: ROLES.CAJERO,
    avatar: '🧑‍💻',
    shift: 'Turno Mañana'
  }
];

/**
 * Autentica un usuario verificando credenciales de prueba.
 * Acepta contraseña '123' o '{username}123' para facilitar pruebas.
 */
export function authenticateUser(username, password) {
  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanUser || !cleanPass) {
    return { success: false, error: 'Por favor, ingresa tu usuario y contraseña.' };
  }

  const foundUser = TEST_USERS.find(
    (u) => u.username.toLowerCase() === cleanUser
  );

  if (!foundUser) {
    return { success: false, error: 'Usuario no encontrado. Revisa los datos de prueba.' };
  }

  // Acepta la clave asignada ('123') o 'admin123', 'mesero123', etc.
  const isValidPass =
    cleanPass === foundUser.password ||
    cleanPass === `${foundUser.username}123` ||
    cleanPass === '123456';

  if (!isValidPass) {
    return { success: false, error: 'Contraseña incorrecta. (Prueba con "123")' };
  }

  return { success: true, user: foundUser };
}
