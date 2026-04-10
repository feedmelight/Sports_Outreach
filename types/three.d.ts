declare module 'three' {
  export class Color {
    constructor(color: string);
  }
  export class MeshPhongMaterial {
    constructor(params?: {
      color?: Color | string;
      shininess?: number;
      transparent?: boolean;
      opacity?: number;
    });
  }
  export class MeshBasicMaterial {
    constructor(params?: {
      color?: Color | string;
      transparent?: boolean;
    });
  }
}
