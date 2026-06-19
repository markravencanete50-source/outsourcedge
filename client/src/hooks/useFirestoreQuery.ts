/**
 * useFirestoreQuery.ts
 *
 * A single reusable hook that replaces every copy-pasted
 * useEffect + onSnapshot pattern across the pages.
 *
 * Usage:
 *   const { data, loading, error } = useFirestoreQuery<MyType>(
 *     collection(db, "myCollection"),
 *     [orderBy("createdAt", "desc"), where("active", "==", true)]  // optional
 *   );
 */

import { useState, useEffect } from "react";
import {
  Query,
  CollectionReference,
  QueryConstraint,
  query,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";

interface FirestoreQueryResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export function useFirestoreQuery<T = DocumentData>(
  ref: CollectionReference<DocumentData> | Query<DocumentData>,
  constraints: QueryConstraint[] = []
): FirestoreQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Build the query with optional constraints (orderBy, where, limit, etc.)
    const q = constraints.length > 0 ? query(ref, ...constraints) : ref;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    // ✅ Always clean up — this is what was missing on every page
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty deps: subscribe once, clean up on unmount

  return { data, loading, error };
}
