import type { GeoFeatureCollection } from '../types';

export const COUNTRIES_GEOJSON: GeoFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: 'Canada', id: 'CAN' }, geometry: { type: 'Polygon', coordinates: [[[-141,69],[-141,60],[-130,55],[-124,48],[-115,49],[-100,49],[-83,42],[-75,45],[-67,45],[-60,46],[-52,47],[-55,52],[-60,60],[-70,75],[-100,80],[-130,75],[-141,69]]] } },
    { type: 'Feature', properties: { name: 'USA', id: 'USA' }, geometry: { type: 'Polygon', coordinates: [[[-125,48],[-100,49],[-80,48],[-67,45],[-75,25],[-82,25],[-100,26],[-117,32],[-125,48]]] } },
    { type: 'Feature', properties: { name: 'France', id: 'FRA' }, geometry: { type: 'Polygon', coordinates: [[[-5,48],[8,49],[7,43],[-2,43],[-5,48]]] } },
    { type: 'Feature', properties: { name: 'United Kingdom', id: 'GBR' }, geometry: { type: 'Polygon', coordinates: [[[-8,55],[-5,59],[2,59],[2,51],[-5,50],[-8,55]]] } },
    { type: 'Feature', properties: { name: 'Brazil', id: 'BRA' }, geometry: { type: 'Polygon', coordinates: [[[-70,-10],[-60,5],[-45,0],[-35,-10],[-40,-30],[-60,-30],[-70,-10]]] } },
    { type: 'Feature', properties: { name: 'Japan', id: 'JPN' }, geometry: { type: 'Polygon', coordinates: [[[130,30],[145,30],[145,45],[130,45],[130,30]]] } },
    { type: 'Feature', properties: { name: 'Germany', id: 'DEU' }, geometry: { type: 'Polygon', coordinates: [[[6,50],[15,50],[15,55],[6,55],[6,50]]] } },
  ],
};
