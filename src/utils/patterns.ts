// Create a patterns utility file
export interface Pattern {
  id: string
  name: string
  css: {
    backgroundColor?: string
    backgroundImage?: string
    backgroundSize?: string
    backgroundPosition?: string,
    backgroundRepeat?: string
  }
  colors: {
    primary: string
    secondary: string
  }
  intensity?: {
    min: number
    max: number
    default: number
    unit: 'px' | '%'
  }
}

export const patterns: Pattern[] = [
  {
    id: 'waves',
    name: 'Waves',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(45deg, #8B5CF6 25%, transparent 25%),
        linear-gradient(-45deg, #8B5CF6 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #8B5CF6 75%),
        linear-gradient(-45deg, transparent 75%, #8B5CF6 75%)
      `,
      backgroundSize: '100px 100px',
      backgroundPosition: '-50px 0, -50px 0, -50px 0, -50px 0'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'diagonal-stripes',
    name: 'Diagonal Stripes',
    css: {
      backgroundImage: `repeating-linear-gradient(
        45deg,
        #1a1a2e,
        #1a1a2e 10px,
        #8B5CF6 10px,
        #8B5CF6 20px
      )`,

    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'hexagons',
    name: 'Hexagons',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        radial-gradient(circle farthest-side at 0% 50%, #1a1a2e 23.5%, rgba(240, 166, 17, 0) 0)21px 30px,
        radial-gradient(circle farthest-side at 0% 50%, #8B5CF6 24%, rgba(240, 166, 17, 0) 0)19px 30px,
        linear-gradient(#1a1a2e 14%, rgba(240, 166, 17, 0) 0, rgba(240, 166, 17, 0) 85%, #1a1a2e 0)0 0,
        linear-gradient(150deg, #1a1a2e 24%, #8B5CF6 0, #8B5CF6 26%, rgba(240, 166, 17, 0) 0, rgba(240, 166, 17, 0) 74%, #8B5CF6 0, #8B5CF6 76%, #1a1a2e 0)0 0,
        linear-gradient(30deg, #1a1a2e 24%, #8B5CF6 0, #8B5CF6 26%, rgba(240, 166, 17, 0) 0, rgba(240, 166, 17, 0) 74%, #8B5CF6 0, #8B5CF6 76%, #1a1a2e 0)0 0,
        linear-gradient(90deg, #8B5CF6 2%, #1a1a2e 0, #1a1a2e 98%, #8B5CF6 0%)0 0 #1a1a2e
      `,
      backgroundSize: '40px 60px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'dots',
    name: 'Dots',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `radial-gradient(#8B5CF6 2px, transparent 2px)`,
      backgroundSize: '30px 30px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'zigzag',
    name: 'Zigzag',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(135deg, #8B5CF6 25%, transparent 25%),
        linear-gradient(225deg, #8B5CF6 25%, transparent 25%),
        linear-gradient(315deg, #8B5CF6 25%, transparent 25%),
        linear-gradient(45deg, #8B5CF6 25%, transparent 25%)
      `,
      backgroundSize: '100px 100px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'checkerboard',
    name: 'Checkerboard',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(45deg, #8B5CF6 25%, transparent 25%),
        linear-gradient(-45deg, #8B5CF6 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #8B5CF6 75%),
        linear-gradient(-45deg, transparent 75%, #8B5CF6 75%)
      `,
      backgroundSize: '60px 60px',
      backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'circuit',
    name: 'Circuit',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(#8B5CF6 2px, transparent 2px),
        linear-gradient(90deg, #8B5CF6 2px, transparent 2px),
        linear-gradient(#8B5CF6 1px, transparent 1px),
        linear-gradient(90deg, #8B5CF6 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px, 50px 50px, 10px 10px, 10px 10px',
      backgroundPosition: '-2px -2px, -2px -2px, -1px -1px, -1px -1px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'bubbles',
    name: 'Bubbles',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        radial-gradient(circle at 25px 25px, #8B5CF6 2%, transparent 2%),
        radial-gradient(circle at 75px 75px, #8B5CF6 2%, transparent 2%)
      `,
      backgroundSize: '100px 100px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'weave',
    name: 'Weave',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(45deg, #8B5CF6 12%, transparent 0, transparent 88%, #8B5CF6 0),
        linear-gradient(135deg, transparent 37%, #6D28D9 0, #6D28D9 63%, transparent 0),
        linear-gradient(45deg, transparent 37%, #8B5CF6 0, #8B5CF6 63%, transparent 0)
      `,
      backgroundSize: '40px 40px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'japanese',
    name: 'Japanese',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(45deg, #8B5CF6 50%, transparent 50%),
        linear-gradient(-45deg, #8B5CF6 50%, transparent 50%)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 0'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'carbon',
    name: 'Carbon',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(45deg, #8B5CF6 25%, transparent 25%, transparent 75%, #8B5CF6 75%, #8B5CF6),
        linear-gradient(45deg, #8B5CF6 25%, transparent 25%, transparent 75%, #8B5CF6 75%, #8B5CF6)
      `,
      backgroundSize: '10px 10px',
      backgroundPosition: '0 0, 5px 5px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'triangles',
    name: 'Triangles',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(45deg, #8B5CF6 50%, transparent 50%),
        linear-gradient(-45deg, #8B5CF6 50%, transparent 50%)
      `,
      backgroundSize: '20px 20px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'crosses',
    name: 'Crosses',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(#8B5CF6 1px, transparent 1px),
        linear-gradient(90deg, #8B5CF6 1px, transparent 1px)
      `,
      backgroundSize: '15px 15px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'diamonds',
    name: 'Diamonds',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(45deg, #8B5CF6 25%, transparent 25%),
        linear-gradient(-45deg, #8B5CF6 25%, transparent 25%)
      `,
      backgroundSize: '30px 30px',
      backgroundPosition: '0 0, 15px 0'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'stars',
    name: 'Stars',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        radial-gradient(#8B5CF6 2px, transparent 2px),
        radial-gradient(#8B5CF6 1px, transparent 1px)
      `,
      backgroundSize: '30px 30px, 15px 15px',
      backgroundPosition: '0 0, 15px 15px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'maze',
    name: 'Maze',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(30deg, #8B5CF6 12%, transparent 12.5%, transparent 87%, #8B5CF6 87.5%, #8B5CF6),
        linear-gradient(150deg, #8B5CF6 12%, transparent 12.5%, transparent 87%, #8B5CF6 87.5%, #8B5CF6),
        linear-gradient(30deg, #8B5CF6 12%, transparent 12.5%, transparent 87%, #8B5CF6 87.5%, #8B5CF6),
        linear-gradient(150deg, #8B5CF6 12%, transparent 12.5%, transparent 87%, #8B5CF6 87.5%, #8B5CF6),
        linear-gradient(60deg, #8B5CF677 25%, transparent 25.5%, transparent 75%, #8B5CF677 75%, #8B5CF677),
        linear-gradient(60deg, #8B5CF677 25%, transparent 25.5%, transparent 75%, #8B5CF677 75%, #8B5CF677)
      `,
      backgroundSize: '40px 70px',
      backgroundPosition: '0 0, 0 0, 20px 35px, 20px 35px, 0 0, 20px 35px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'isometric-cubes',
    name: 'Isometric Cubes',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(30deg, #8B5CF6 12%, transparent 12.5%, transparent 87%, #8B5CF6 87.5%, #8B5CF6),
        linear-gradient(150deg, #8B5CF6 12%, transparent 12.5%, transparent 87%, #8B5CF6 87.5%, #8B5CF6),
        linear-gradient(30deg, #8B5CF6 12%, transparent 12.5%, transparent 87%, #8B5CF6 87.5%, #8B5CF6),
        linear-gradient(150deg, #8B5CF6 12%, transparent 12.5%, transparent 87%, #8B5CF6 87.5%, #8B5CF6),
        linear-gradient(60deg, #8B5CF677 25%, transparent 25.5%, transparent 75%, #8B5CF677 75%, #8B5CF677),
        linear-gradient(60deg, #8B5CF677 25%, transparent 25.5%, transparent 75%, #8B5CF677 75%, #8B5CF677)
      `,
      backgroundSize: '80px 140px',
      backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 40,
      max: 200,
      default: 80,
      unit: 'px'
    }
  },
  {
    id: 'circuit-board',
    name: 'Circuit Board',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(#8B5CF6 1px, transparent 1px),
        linear-gradient(to right, #8B5CF6 1px, transparent 1px),
        radial-gradient(#8B5CF6 2px, transparent 2px)
      `,
      backgroundSize: '40px 40px, 40px 40px, 80px 80px',
      backgroundPosition: '0 0, 0 0, 20px 20px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 100,
      default: 40,
      unit: 'px'
    }
  },
  {
    id: 'honeycomb',
    name: 'Honeycomb',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        radial-gradient(circle farthest-side at 0% 50%, #1a1a2e 23.5%, rgba(240, 166, 17, 0) 0)21px 30px,
        radial-gradient(circle farthest-side at 0% 50%, #8B5CF6 24%, rgba(240, 166, 17, 0) 0)19px 30px,
        linear-gradient(#1a1a2e 14%, rgba(240, 166, 17, 0) 0, rgba(240, 166, 17, 0) 85%, #1a1a2e 0)0 0,
        linear-gradient(150deg, #1a1a2e 24%, #8B5CF6 0, #8B5CF6 26%, rgba(240, 166, 17, 0) 0, rgba(240, 166, 17, 0) 74%, #8B5CF6 0, #8B5CF6 76%, #1a1a2e 0)0 0,
        linear-gradient(30deg, #1a1a2e 24%, #8B5CF6 0, #8B5CF6 26%, rgba(240, 166, 17, 0) 0, rgba(240, 166, 17, 0) 74%, #8B5CF6 0, #8B5CF6 76%, #1a1a2e 0)0 0
      `,
      backgroundSize: '40px 50px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 100,
      default: 40,
      unit: 'px'
    }
  },
  {
    id: 'morphing-diamonds',
    name: 'Morphing Diamonds',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(135deg, #8B5CF6 25%, transparent 25%),
        linear-gradient(225deg, #8B5CF6 25%, transparent 25%),
        linear-gradient(45deg, #8B5CF6 25%, transparent 25%),
        linear-gradient(315deg, #8B5CF6 25%, transparent 25%)
      `,
      backgroundPosition: '10px 0, 10px 0, 0 0, 0 0',
      backgroundSize: '20px 20px',
      backgroundRepeat: 'repeat'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 10,
      max: 50,
      default: 20,
      unit: 'px'
    }
  },
  {
    id: 'pixel-grid',
    name: 'Pixel Grid',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(#8B5CF6 1px, transparent 1px),
        linear-gradient(90deg, #8B5CF6 1px, transparent 1px),
        linear-gradient(#8B5CF633 1px, transparent 1px),
        linear-gradient(90deg, #8B5CF633 1px, transparent 1px)
      `,
      backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
      backgroundPosition: '-1px -1px, -1px -1px, -1px -1px, -1px -1px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'diagonal-lines',
    name: 'Diagonal Lines',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `repeating-linear-gradient(
        45deg,
        #8B5CF6 0,
        #8B5CF6 2px,
        transparent 2px,
        transparent 10px
      )`
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    }
  },
  {
    id: 'cross-dots',
    name: 'Cross Dots',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        radial-gradient(#8B5CF6 2px, transparent 2px),
        radial-gradient(#8B5CF6 2px, transparent 2px)
      `,
      backgroundSize: '30px 30px',
      backgroundPosition: '0 0, 15px 15px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    }
  },
  {
    id: 'squares',
    name: 'Squares',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(#8B5CF6 1px, transparent 1px),
        linear-gradient(90deg, #8B5CF6 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    }
  },
  {
    id: 'circles-grid',
    name: 'Circles Grid',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        radial-gradient(circle at center, #8B5CF6 1px, transparent 1px),
        radial-gradient(circle at center, #8B5CF6 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 10px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    }
  },
  {
    id: 'zigzag-lines',
    name: 'Zigzag Lines',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(135deg, #8B5CF6 25%, transparent 25%) -10px 0,
        linear-gradient(225deg, #8B5CF6 25%, transparent 25%) -10px 0,
        linear-gradient(315deg, #8B5CF6 25%, transparent 25%),
        linear-gradient(45deg, #8B5CF6 25%, transparent 25%)
      `,
      backgroundSize: '20px 20px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    }
  },
  {
    id: 'plus-signs',
    name: 'Plus Signs',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(#8B5CF6 2px, transparent 2px),
        linear-gradient(90deg, #8B5CF6 2px, transparent 2px)
      `,
      backgroundSize: '30px 30px',
      backgroundPosition: '-1px -1px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    }
  },
  {
    id: 'diagonal-checkers',
    name: 'Diagonal Checkers',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(45deg, #8B5CF6 25%, transparent 25%, transparent 75%, #8B5CF6 75%, #8B5CF6),
        linear-gradient(45deg, #8B5CF6 25%, transparent 25%, transparent 75%, #8B5CF6 75%, #8B5CF6)
      `,
      backgroundPosition: '0 0, 15px 15px',
      backgroundSize: '30px 30px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    }
  },
  {
    id: 'dotted-grid',
    name: 'Dotted Grid',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        radial-gradient(#8B5CF6 1px, transparent 1px),
        radial-gradient(#8B5CF6 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 10px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    }
  },
  {
    id: 'cross-lines',
    name: 'Cross Lines',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(45deg, #8B5CF6 1px, transparent 1px),
        linear-gradient(-45deg, #8B5CF6 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    }
  },
  {
    id: 'brick-wall',
    name: 'Brick Wall',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(#8B5CF6 2px, transparent 2px),
        linear-gradient(90deg, #8B5CF6 2px, transparent 2px)
      `,
      backgroundSize: '50px 30px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    }
  },
  {
    id: 'distorted-lines',
    name: 'Distorted Lines',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 20px,
          #8B5CF6 20px,
          #8B5CF6 40px
        ),
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 20px,
          #8B5CF6 20px,
          #8B5CF6 40px
        )
      `,
      backgroundSize: '100px 100px',
      backgroundPosition: '0 0'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 100,
      unit: 'px'
    }
  },
  {
    id: 'wavy-lines',
    name: 'Wavy Lines',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        repeating-linear-gradient(
          45deg,
          #8B5CF6 0,
          #8B5CF6 1px,
          transparent 1px,
          transparent 50%
        ),
        repeating-linear-gradient(
          -45deg,
          #8B5CF6 0,
          #8B5CF6 1px,
          transparent 1px,
          transparent 50%
        )
      `,
      backgroundSize: '30px 30px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 10,
      max: 100,
      default: 30,
      unit: 'px'
    }
  },
  {
    id: 'interference',
    name: 'Interference',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        repeating-linear-gradient(
          0deg,
          #8B5CF6,
          #8B5CF6 1px,
          transparent 1px,
          transparent 20px
        ),
        repeating-linear-gradient(
          90deg,
          #8B5CF6,
          #8B5CF6 1px,
          transparent 1px,
          transparent 20px
        ),
        linear-gradient(
          45deg,
          transparent 0%,
          transparent 25%,
          #8B5CF644 25%,
          #8B5CF644 50%,
          transparent 50%,
          transparent 75%,
          #8B5CF644 75%,
          #8B5CF644 100%
        )
      `,
      backgroundSize: '20px 20px, 20px 20px, 40px 40px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 10,
      max: 100,
      default: 20,
      unit: 'px'
    }
  },
  {
    id: 'noise-lines',
    name: 'Noise Lines',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(
          90deg,
          transparent 50%,
          #8B5CF644 50%
        ),
        linear-gradient(
          90deg,
          #8B5CF622 25%,
          transparent 25%,
          transparent 75%,
          #8B5CF622 75%
        ),
        linear-gradient(
          0deg,
          #8B5CF6 1px,
          transparent 1px
        )
      `,
      backgroundSize: '50px 50px, 100px 100px, 20px 20px'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 200,
      default: 50,
      unit: 'px'
    }
  },
  {
    id: 'hearts-grid',
    name: 'Hearts Grid',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        radial-gradient(circle at 50% 40%, #8B5CF6 3px, transparent 4px),
        radial-gradient(circle at 50% 60%, #8B5CF6 3px, transparent 4px),
        radial-gradient(circle at 42% 50%, #8B5CF6 3px, transparent 4px),
        radial-gradient(circle at 58% 50%, #8B5CF6 3px, transparent 4px)
      `,
      backgroundSize: '30px 30px',
      backgroundPosition: '0 0'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 100,
      default: 30,
      unit: 'px'
    }
  },
  {
    id: 'lifeline',
    name: 'Lifeline',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(90deg, transparent 49%, #8B5CF6 49%, #8B5CF6 51%, transparent 51%),
        linear-gradient(90deg, transparent 49%, #8B5CF644 49%, #8B5CF644 51%, transparent 51%),
        linear-gradient(0deg, #8B5CF6 2px, transparent 2px)
      `,
      backgroundSize: '20px 10px, 40px 20px, 20px 20px',
      backgroundPosition: '0 0'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 10,
      max: 50,
      default: 20,
      unit: 'px'
    }
  },
  {
    id: 'heartbeat',
    name: 'Heartbeat',
    css: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `
        linear-gradient(90deg, transparent 45%, #8B5CF6 45%, #8B5CF6 55%, transparent 55%),
        linear-gradient(90deg, transparent 45%, #8B5CF6 45%, #8B5CF6 55%, transparent 55%),
        linear-gradient(135deg, transparent 45%, #8B5CF6 45%, #8B5CF6 55%, transparent 55%),
        linear-gradient(45deg, transparent 45%, #8B5CF6 45%, #8B5CF6 55%, transparent 55%),
        linear-gradient(90deg, transparent 45%, #8B5CF6 45%, #8B5CF6 55%, transparent 55%)
      `,
      backgroundSize: '40px 2px, 80px 2px, 10px 10px, 10px 10px, 20px 2px',
      backgroundPosition: '0 50%, 0 calc(50% + 4px), 20px calc(50% - 3px), 20px calc(50% + 3px), 40px 50%'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#1a1a2e'
    },
    intensity: {
      min: 20,
      max: 100,
      default: 40,
      unit: 'px'
    }
  }
] 