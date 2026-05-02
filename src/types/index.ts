export interface Article {
  title: string;
  description: string;
  content: string;
  url: string;
  source: { name: string };
  wasTranslated: boolean;
}

export interface GeoFeature {
  type: 'Feature';
  properties: { name: string; id: string };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}
