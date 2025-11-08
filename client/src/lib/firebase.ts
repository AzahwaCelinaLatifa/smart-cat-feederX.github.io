 // Lightweight local stub to replace Firebase during development
// This provides the minimal surface the app expects so you can run
// the frontend without the Firebase SDK or services.

export type User = { uid: string; email?: string | null } | null;

// --- Auth stub ---
let currentUser: User = null;
const authListeners: Array<(u: User) => void> = [];

export const auth = { _internal: true } as const;

export function onAuthStateChanged(_auth: any, cb: (u: User) => void) {
  authListeners.push(cb);
  // call once with current value (async to mimic real SDK)
  setTimeout(() => cb(currentUser), 0);
  // return unsubscribe
  return () => {
    const idx = authListeners.indexOf(cb);
    if (idx >= 0) authListeners.splice(idx, 1);
  };
}

export async function signInWithEmailAndPassword(_auth: any, email: string, _password: string) {
  // very small emulation of signing in
  currentUser = { uid: `local-${Date.now()}`, email };
  // notify listeners
  authListeners.forEach((l) => l(currentUser));
  return { user: currentUser };
}

export async function createUserWithEmailAndPassword(_auth: any, email: string, _password: string) {
  // emulate creating a user and signing them in
  currentUser = { uid: `local-${Date.now()}`, email };
  authListeners.forEach((l) => l(currentUser));
  return { user: currentUser };
}

export async function signOut(_auth: any) {
  currentUser = null;
  authListeners.forEach((l) => l(currentUser));
  return;
}

// --- Functions stub ---
export function getFunctions() {
  return { _local: true };
}

export function httpsCallable(_functions: any, _name: string) {
  return async (payload?: any) => {
    // emulate a simple response shape used in the app
    return { data: { commandId: `local-${Date.now()}`, payload } };
  };
}

// --- Firestore-like lightweight in-memory store ---
type Doc = { id: string; data: any };
const collections = new Map<string, Map<string, any>>();

export const db = { _local: true };

export function collection(_db: any, name: string) {
  if (!collections.has(name)) collections.set(name, new Map());
  return name;
}

export async function addDoc(collectionRef: string, data: any) {
  const col = collections.get(collectionRef)!;
  const id = `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  col.set(id, data);
  return { id, data };
}

export async function getDocs(collectionRef: string) {
  const col = collections.get(collectionRef) ?? new Map();
  const docs: Doc[] = [];
  for (const [id, data] of col.entries()) docs.push({ id, data });
  return { docs };
}

export function doc(_db: any, collectionName: string, id: string) {
  return { collectionName, id };
}

export async function updateDoc(ref: { collectionName: string; id: string }, data: any) {
  const col = collections.get(ref.collectionName);
  if (!col || !col.has(ref.id)) throw new Error('Document not found');
  const existing = col.get(ref.id);
  col.set(ref.id, { ...existing, ...data });
  return;
}

export async function deleteDoc(ref: { collectionName: string; id: string }) {
  const col = collections.get(ref.collectionName);
  if (!col) return;
  col.delete(ref.id);
  return;
}

// --- Realtime DB minimal stub ---
const rtdb = new Map<string, any>();
const rtdbListeners = new Map<string, Set<(v: any) => void>>();

export function getDatabase(_app?: any) {
  return { _local: true };
}

export function ref(_db: any, path: string) {
  return path;
}

export async function push(path: string, value: any) {
  const obj = rtdb.get(path) ?? {};
  const id = `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const entry = { id, ...value };
  obj[id] = entry;
  rtdb.set(path, obj);
  // notify listeners on parent path
  const set = rtdbListeners.get(path);
  if (set) set.forEach((l) => l(obj));
  return { key: id };
}

export async function remove(pathOrRef: any) {
  const path = String(pathOrRef);
  // support deleting a child: 'parent/child'
  if (path.includes("/")) {
    const [parent, child] = path.split("/");
    const obj = rtdb.get(parent);
    if (obj && typeof obj === "object") {
      delete obj[child];
      rtdb.set(parent, obj);
      const set = rtdbListeners.get(parent);
      if (set) set.forEach((l) => l(obj));
    }
    return;
  }

  // remove entire node
  rtdb.delete(path);
  const set = rtdbListeners.get(path);
  if (set) set.forEach((l) => l(undefined));
}

export async function update(pathOrRef: any, value: any) {
  const path = String(pathOrRef);
  // support updating child: 'parent/child' -> update parent[child]
  if (path.includes("/")) {
    const [parent, child] = path.split("/");
    const obj = rtdb.get(parent) ?? {};
    obj[child] = { id: child, ...(value as object) };
    rtdb.set(parent, obj);
    const set = rtdbListeners.get(parent);
    if (set) set.forEach((l) => l(obj));
    return;
  }

  rtdb.set(path, value);
  const set = rtdbListeners.get(path);
  if (set) set.forEach((l) => l(value));
}

export function onValue(pathOrRef: any, cb: (snapshot: any) => void) {
  const path = String(pathOrRef);
  if (!rtdbListeners.has(path)) rtdbListeners.set(path, new Set());
  rtdbListeners.get(path)!.add((v) => cb({ val: () => v }));
  // call immediately
  setTimeout(() => cb({ val: () => rtdb.get(path) }), 0);
}

export function off(pathOrRef: any, cb?: (snapshot: any) => void) {
  const path = String(pathOrRef);
  if (!rtdbListeners.has(path)) return;
  if (!cb) {
    rtdbListeners.delete(path);
    return;
  }
  const set = rtdbListeners.get(path)!;
  // best-effort: remove all by reference equality is not available here, so clear
  set.clear();
}

// initialize empty collections used by app
collections.set('feedingSchedules', new Map());

export default { auth, db };