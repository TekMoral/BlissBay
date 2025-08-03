// import { useEffect } from 'react';

// const BfCacheHandler = () => {
//   useEffect(() => {
//     const handlePageShow = (event) => {
//       console.log('[BfCacheHandler] pageshow fired. persisted:', event.persisted);
//       if (event.persisted) {
//         console.log('[BfCacheHandler] Restored from bfcache → Forcing reload');
//         window.location.reload();
//       }
//     };

//     window.addEventListener('pageshow', handlePageShow);
//     return () => window.removeEventListener('pageshow', handlePageShow);
//   }, []);

//   return null;
// };

// export default BfCacheHandler;
