import { createContext, useContext, useState, useMemo } from 'react';

const UserContext = createContext();

const STORAGE_KEY = 'users';

// ✅ SIMULATE API DELAY - Makes it look like real cloud calls
const simulateDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// ---------- Helpers ----------
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Ensure the admin account always exists
const ensureAdminExists = (users) => {
  const hasAdmin = users.some(u => u.email === 'admin@disasterlink.com');
  if (hasAdmin) return users;

  return [
    ...users,
    {
      id: 'admin-001',
      fullName: 'System Administrator',
      email: 'admin@disasterlink.com',
      role: 'admin',
      status: 'Active',
      verification: 'Verified',
      phone: 'N/A',
      location: 'System Administrator',
      createdAt: new Date().toISOString(),
      password: 'admin123',
    },
  ];
};

const loadInitialUsers = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return ensureAdminExists(parsed);
  } catch (e) {
    console.error('Failed to load users:', e);
    return ensureAdminExists([]);
  }
};

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState(loadInitialUsers);
  const [loading, setLoading] = useState(false);

  // ---------- Persist ----------
  const saveToLocalStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('disasterDataUpdated'));
  };

  // ---------- Create ----------
  const addUser = async (userData) => {
    setLoading(true);
    try {
      await simulateDelay(1000);

      const newUser = {
        id: userData.id || `usr-${Date.now()}`,
        fullName: userData.fullName || 'Unnamed User',
        email: userData.email || '',
        role: userData.role || 'resident',
        status: userData.status || 'Pending',
        verification: userData.verification || 'Unverified',
        phone: userData.phone || '',
        location: userData.location || '',
        skills: userData.skills || [],
        team: userData.team || 'Unassigned',
        createdAt: new Date().toISOString(),
        ...userData,
      };

      const updated = [...users, newUser];
      setUsers(updated);
      saveToLocalStorage(updated);

      console.log(`✅ User created: ${newUser.id} (${newUser.email})`);
      setLoading(false);
      return newUser;
    } catch (error) {
      console.error(error);
      setLoading(false);
      return null;
    }
  };

  // ---------- Update ----------
  const updateUser = async (id, patch) => {
    setLoading(true);
    await simulateDelay(700);

    const updated = users.map(u => (u.id === id ? { ...u, ...patch } : u));
    setUsers(updated);
    saveToLocalStorage(updated);

    console.log(`✅ User ${id} updated`);
    setLoading(false);
  };

  // ---------- Delete ----------
  const deleteUser = async (id) => {
    setLoading(true);
    await simulateDelay(600);

    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    saveToLocalStorage(updated);

    console.log(`✅ User ${id} deleted`);
    setLoading(false);
  };

  // ---------- Toggle status (Active ↔ Suspended) ----------
  const toggleUserStatus = async (id) => {
    setLoading(true);
    await simulateDelay(500);

    const updated = users.map(u => {
      if (u.id !== id) return u;
      const next = u.status === 'Active' ? 'Suspended' : 'Active';
      return { ...u, status: next };
    });
    setUsers(updated);
    saveToLocalStorage(updated);

    console.log(`✅ User ${id} status toggled`);
    setLoading(false);
  };

  // ---------- Derived: volunteers only ----------
  const volunteers = useMemo(
    () => users.filter(u => u.role === 'volunteer'),
    [users]
  );

  // ---------- Derived: stats ----------
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'Active').length;
    const pending = users.filter(u => u.status === 'Pending').length;
    const suspended = users.filter(u => u.status === 'Suspended').length;
    const verified = users.filter(u => u.verification === 'Verified').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const residents = users.filter(u => u.role === 'resident').length;
    const volunteerCount = users.filter(u => u.role === 'volunteer').length;

    const newThisMonth = users.filter(u => {
      if (!u.createdAt) return false;
      const created = new Date(u.createdAt);
      const days = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
      return days <= 30;
    }).length;

    return {
      total,
      active,
      pending,
      suspended,
      verified,
      admins,
      residents,
      volunteers: volunteerCount,
      newThisMonth,
    };
  }, [users]);

  // ---------- Get by id ----------
  const getUserById = (id) => users.find(u => u.id === id) || null;

  return (
    <UserContext.Provider
      value={{
        users,
        volunteers,
        stats,
        loading,
        getUserById,
        getInitials,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};