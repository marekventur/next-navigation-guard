"use client";

import React, { useRef } from "react";
import { useInterceptPageUnload } from "../hooks/useInterceptPageUnload";
import { useInterceptPopState } from "../hooks/useInterceptPopState";
import { useInterceptLinkClicks } from "../hooks/useInterceptLinkClicks";
import { GuardDef } from "../types";
import { InterceptAppRouterProvider } from "./InterceptAppRouterProvider";
import { InterceptPagesRouterProvider } from "./InterceptPagesRouterProvider";
import { NavigationGuardProviderContext } from "./NavigationGuardProviderContext";

export function NavigationGuardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const guardMapRef = useRef(new Map<string, GuardDef>());

  useInterceptPopState({ guardMapRef });
  useInterceptPageUnload({ guardMapRef });
  useInterceptLinkClicks({ guardMapRef });

  return (
    <NavigationGuardProviderContext.Provider value={guardMapRef}>
      <InterceptAppRouterProvider guardMapRef={guardMapRef}>
        <InterceptPagesRouterProvider guardMapRef={guardMapRef}>
          {children}
        </InterceptPagesRouterProvider>
      </InterceptAppRouterProvider>
    </NavigationGuardProviderContext.Provider>
  );
}
