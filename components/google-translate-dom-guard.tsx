"use client";

import { useEffect } from "react";

export function GoogleTranslateDomGuard() {
  useEffect(() => {
    const originalRemoveChild = Node.prototype.removeChild;
    const originalInsertBefore = Node.prototype.insertBefore;

    Node.prototype.removeChild = function patchedRemoveChild<T extends Node>(
      child: T,
    ): T {
      if (child.parentNode !== this) {
        return child;
      }

      return originalRemoveChild.call(this, child) as T;
    };

    Node.prototype.insertBefore = function patchedInsertBefore<T extends Node>(
      newNode: T,
      referenceNode: Node | null,
    ): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        return originalInsertBefore.call(this, newNode, null) as T;
      }

      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };

    return () => {
      Node.prototype.removeChild = originalRemoveChild;
      Node.prototype.insertBefore = originalInsertBefore;
    };
  }, []);

  return null;
}
