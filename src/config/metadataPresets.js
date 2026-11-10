/**
 * Camera presets for the metadata editor.
 *
 * They only fill camera, lens and software fields. Rights, creator and
 * location fields are intentionally left untouched so a preset can never
 * accidentally claim authorship.
 */

export const METADATA_PRESETS = [
  {
    id: 'canon-r5',
    name: 'Canon EOS R5',
    subtitle: 'RF 24-70mm F2.8L · Lightroom',
    icon: 'camera',
    values: {
      make: 'Canon',
      model: 'Canon EOS R5',
      lensMake: 'Canon',
      lensModel: 'RF 24-70mm F2.8L IS USM',
      software: 'Adobe Photoshop Lightroom Classic',
      creatorTool: 'Adobe Photoshop Lightroom Classic',
    },
  },
  {
    id: 'sony-a7rv',
    name: 'Sony A7R V',
    subtitle: 'FE 24-70mm F2.8 GM II · Capture One',
    icon: 'camera',
    values: {
      make: 'Sony',
      model: 'ILCE-7RM5',
      lensMake: 'Sony',
      lensModel: 'FE 24-70mm F2.8 GM II',
      software: 'Capture One 23 Pro',
      creatorTool: 'Capture One 23 Pro',
    },
  },
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    subtitle: 'Main camera · iOS',
    icon: 'phone',
    values: {
      make: 'Apple',
      model: 'iPhone 15 Pro',
      lensMake: 'Apple',
      lensModel: 'iPhone 15 Pro back triple camera 6.86mm f/1.78',
      software: 'iOS 17.5.1',
      creatorTool: 'iOS 17.5.1',
    },
  },
];
