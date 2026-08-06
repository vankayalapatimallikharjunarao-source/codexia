import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface StudentRecord {
  uid: string;
  name: string;
  email: string;
  updatedAt?: string;
}

export interface EnrollmentRecord {
  uid: string;
  cohortId: string;
  program: string;
  payment_status: "paid" | "failed" | "pending";
  enrollment_status: "active" | "inactive";
  transaction_id: string;
  payment_gateway: string;
  purchased_at: string;
}

/**
 * Save or update student profile document in Firestore (`students` collection)
 */
export async function saveStudentProfileToFirestore(uid: string, name: string, email: string): Promise<void> {
  const path = `students/${uid}`;
  try {
    const studentRef = doc(db, "students", uid);
    await setDoc(
      studentRef,
      {
        uid,
        name: name || email.split("@")[0] || "Student",
        email: email.toLowerCase().trim(),
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch student enrollment document from Firestore (`enrollments` collection)
 */
export async function getStudentEnrollmentFromFirestore(uid: string): Promise<EnrollmentRecord | null> {
  const path = `enrollments/${uid}`;
  try {
    const enrollRef = doc(db, "enrollments", uid);
    const snap = await getDoc(enrollRef);
    if (snap.exists()) {
      return snap.data() as EnrollmentRecord;
    }
    return null;
  } catch (error) {
    console.warn("Firestore enrollment fetch warning:", error);
    // Fallback gracefully if document doesn't exist yet
    return null;
  }
}

/**
 * Create or update active paid enrollment document in Firestore (`enrollments` collection)
 */
export async function createStudentEnrollmentInFirestore(record: EnrollmentRecord): Promise<void> {
  const path = `enrollments/${record.uid}`;
  try {
    const enrollRef = doc(db, "enrollments", record.uid);
    await setDoc(enrollRef, {
      uid: record.uid,
      cohortId: record.cohortId || "CODX-2026-07-BASE-01",
      program: record.program || "Base Cohort",
      payment_status: record.payment_status,
      enrollment_status: record.enrollment_status,
      transaction_id: record.transaction_id || `TXN_${Date.now()}`,
      payment_gateway: record.payment_gateway || "PayU",
      purchased_at: record.purchased_at || new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
