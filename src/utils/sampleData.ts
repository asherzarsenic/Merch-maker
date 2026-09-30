export interface SampleMerch {
  id: string;
  name: string;
  type: string;
  thumbnail: string;
  description: string;
  defaultPrompt: string;
}

export const SAMPLE_MERCHANDISE: SampleMerch[] = [
  {
    id: 'sample-1',
    name: 'Vintage Blossom Tee',
    type: 'T-Shirt',
    thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    description: 'Black t-shirt with a vintage pastel pink floral typography print.',
    defaultPrompt: 'Extract the floral blossom illustration and surrounding typography cleanly on pure white background.',
  },
  {
    id: 'sample-2',
    name: 'Cyberpunk Aesthetic Hoodie',
    type: 'Hoodie',
    thumbnail: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    description: 'Graphic sweatshirt featuring neon pink and lilac geometric emblem artwork.',
    defaultPrompt: 'Isolate the front chest emblem graphic, flatten perspective, remove hoodie seams.',
  },
  {
    id: 'sample-3',
    name: 'Artisan Ceramic Coffee Mug',
    type: 'Mug',
    thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    description: 'White ceramic mug featuring hand-lettered botanical logo artwork.',
    defaultPrompt: 'Unwrap the curved ceramic graphic and extract the botanical logo flat and sharp.',
  },
  {
    id: 'sample-4',
    name: 'Canvas Botanical Tote Bag',
    type: 'Tote Bag',
    thumbnail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    description: 'Natural canvas tote with delicate lilac wildflower and butterfly print.',
    defaultPrompt: 'Extract only the wildflower and butterfly print, eliminate canvas fabric texture.',
  },
];
