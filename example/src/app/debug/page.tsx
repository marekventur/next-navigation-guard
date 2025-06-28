'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DebugPage() {
  const router = useRouter();
  
  useEffect(() => {
    console.log('=== Checking Next.js Navigation APIs ===');
    
    // Check router object
    console.log('useRouter() object:', router);
    console.log('Router keys:', Object.keys(router));
    
    // Check window.next
    console.log('\n=== window.next ===');
    console.log('window.next:', window.next);
    if (window.next?.router) {
      console.log('window.next.router:', window.next.router);
      console.log('window.next.router keys:', Object.keys(window.next.router));
    }
    
    // Try to import Next.js modules dynamically
    console.log('\n=== Trying dynamic imports ===');
    
    // Check if we can access internal navigation functions
    try {
      // @ts-ignore
      import('next/dist/client/components/app-router-instance').then(module => {
        console.log('app-router-instance module:', module);
        console.log('Module exports:', Object.keys(module));
        if (module.dispatchNavigateAction) {
          console.log('Found dispatchNavigateAction!', module.dispatchNavigateAction);
        }
      }).catch(err => {
        console.log('Failed to import app-router-instance:', err.message);
      });
    } catch (e) {
      console.log('Import failed:', e);
    }
    
    // Check React internals for fiber nodes that might have navigation
    console.log('\n=== Checking React Fiber ===');
    const rootElement = document.getElementById('__next');
    if (rootElement) {
      // @ts-ignore
      const reactFiber = rootElement._reactRootContainer?._internalRoot?.current;
      if (reactFiber) {
        console.log('Found React Fiber root');
        // Walk fiber tree looking for router context
        let fiber = reactFiber;
        let depth = 0;
        while (fiber && depth < 20) {
          if (fiber.memoizedProps?.value?.router) {
            console.log('Found router in fiber:', fiber.memoizedProps.value.router);
          }
          fiber = fiber.child;
          depth++;
        }
      }
    }
    
    // Check for navigation events
    console.log('\n=== Monitoring navigation ===');
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      console.log('pushState called:', args);
      return originalPushState.apply(history, args);
    };
    
    history.replaceState = function(...args) {
      console.log('replaceState called:', args);
      return originalReplaceState.apply(history, args);
    };
  }, [router]);
  
  return (
    <div>
      <h1>Debug Page</h1>
      <p>Check browser console for navigation function discovery</p>
      <button onClick={() => router.push('/page1')}>
        Test router.push()
      </button>
    </div>
  );
}