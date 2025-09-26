// src/declarations.d.ts
declare module "@mapbox/mapbox-gl-draw" {
  import type { IControl } from "mapbox-gl";

  export default class MapboxDraw implements IControl {
    constructor(options?: any);
    getAll(): any;
    getMode(): string;
    changeMode(mode: string, options?: any): void;
    /**
     * Add a feature or array of features to the draw instance.
     * Returns an array of created feature ids (string[])
     */
    add(feature: any | any[]): string[];
    /**
     * Delete one or multiple features by id. If omitted, deletes current selection.
     */
    delete(ids?: string | string[]): void;
    deleteAll(): void;
  }
}
