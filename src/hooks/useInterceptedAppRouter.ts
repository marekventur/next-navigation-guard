import {
  AppRouterContext,
  AppRouterInstance,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import { MutableRefObject, useContext, useMemo } from "react";
import { GuardDef } from "../types";
import { debug } from "../utils/debug";

export function useInterceptedAppRouter({
  guardMapRef,
}: {
  guardMapRef: MutableRefObject<Map<string, GuardDef>>;
}) {
  const origRouter = useContext(AppRouterContext);

  return useMemo((): AppRouterInstance | null => {
    if (!origRouter) {
      debug("No original router found");
      return null;
    }
    debug("Creating intercepted router");

    const guarded = async (
      type: "push" | "replace" | "refresh",
      to: string,
      accepted: () => void
    ) => {
      debug(`Navigation attempt: ${type} to ${to}`);
      const defs = [...guardMapRef.current.values()];
      for (const { enabled, callback } of defs) {
        if (!enabled({ to, type })) continue;

        debug(`Calling guard callback for ${type} to ${to}`);
        const confirm = await callback({ to, type });
        debug(`Guard callback returned: ${confirm}`);
        if (!confirm) {
          debug(`Navigation blocked`);
          return;
        }
      }
      debug(`All guards passed, proceeding with navigation`);
      accepted();
    };

    return {
      ...origRouter,
      push: (href, ...args) => {
        debug(`push called with href: ${href}`);
        guarded("push", href, () => origRouter.push(href, ...args));
      },
      replace: (href, ...args) => {
        guarded("replace", href, () => origRouter.replace(href, ...args));
      },
      refresh: (...args) => {
        guarded("refresh", location.href, () => origRouter.refresh(...args));
      },
    };
  }, [origRouter]);
}
