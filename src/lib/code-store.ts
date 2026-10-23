// In-memory only: the attendance code never touches URL, storage or logs.
let current: { fullName: string; attendanceCode: string } | null = null;
export const setLastRegistration = (v: typeof current) => { current = v; };
export const getLastRegistration = () => current;
