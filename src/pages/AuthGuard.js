import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase-config';
import { getDoc } from 'firebase/firestore';
import { uidToStudentIdRef } from './firestoreRefs';

export const useAuthGuard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const mappingRef = uidToStudentIdRef(user.uid);
        const mappingSnap = await getDoc(mappingRef);
        
        if (!mappingSnap.exists()) {
          navigate('/profile');
        }
      } catch (error) {
        console.error('Auth guard error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return loading;
};