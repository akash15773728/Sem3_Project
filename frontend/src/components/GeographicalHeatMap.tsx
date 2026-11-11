import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { HeatMapNode, PotentialGapItem } from '../types';
import { Layers, MapPin, Search, AlertTriangle, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

interface GeographicalHeatMapProps {
  districtName: string;
  nodes: HeatMapNode[];
  onInspectEvidence?: (facilityId: number, facilityName: string) => void;
}

export const GeographicalHeatMap: React.FC<GeographicalHeatMapProps> = ({
  districtName,
  nodes,
  onInspectEvidence
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Equipment' | 'Specialists' | 'Beds'>('All');
  const [selectedFacility, setSelectedFacility] = useState<HeatMapNode | null>(null);

  // Filter nodes based on selected category
  const filteredNodes = nodes.filter((node) => {
    if (categoryFilter === 'All') return true;
    if (categoryFilter === 'Equipment') {
      const lower = (node.primary_shortage || '').toLowerCase();
      const cat = (node.shortage_category || '').toLowerCase();
      return cat.includes('equipment') || lower.includes('echo') || lower.includes('ct') || lower.includes('mri');
    }
    if (categoryFilter === 'Specialists') {
      const lower = (node.primary_shortage || '').toLowerCase();
      const cat = (node.shortage_category || '').toLowerCase();
      return cat.includes('specialist') || lower.includes('cardio') || lower.includes('neuro') || lower.includes('surgeon');
    }
    if (categoryFilter === 'Beds') {
      const lower = (node.primary_shortage || '').toLowerCase();
      const cat = (node.shortage_category || '').toLowerCase();
      return cat.includes('bed') || lower.includes('bed') || lower.includes('icu');
    }
    return true;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: Central Delhi (28.6432, 77.2250)
      const initialMap = L.map(mapContainerRef.current, {
        center: [28.6432, 77.2250],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | SEHAT-SETU Health Map',
        maxZoom: 18,
      }).addTo(initialMap);

      markersLayerRef.current = L.layerGroup().addTo(initialMap);
      mapInstanceRef.current = initialMap;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render / Update Markers on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const validCoordinates: L.LatLngExpression[] = [];

    filteredNodes.forEach((node) => {
      if (node.latitude == null || node.longitude == null) return;

      const lat = Number(node.latitude);
      const lng = Number(node.longitude);
      validCoordinates.push([lat, lng]);

      const isPotentialGap = node.status === 'Potential Gap' || node.gap_count > 0;
      const isNeedsReview = node.status === 'Needs Review';
      const isHotspot = isPotentialGap && node.referral_count >= 10;

      // Color coding: Red = Potential Gap, Amber = Needs Review, Green = Normal
      let markerColor = '#10B981'; // Green
      let markerRing = 'rgba(16, 185, 129, 0.3)';
      let badgeLabel = 'Normal Operational State';
      let badgeBg = '#ECFDF5';
      let badgeText = '#065F46';

      if (isPotentialGap) {
        markerColor = '#EF4444'; // Red
        markerRing = 'rgba(239, 68, 68, 0.4)';
        badgeLabel = 'Potential Shortage Alert';
        badgeBg = '#FEF2F2';
        badgeText = '#991B1B';
      } else if (isNeedsReview) {
        markerColor = '#F59E0B'; // Amber
        markerRing = 'rgba(245, 158, 11, 0.3)';
        badgeLabel = 'Needs Administrative Review';
        badgeBg = '#FFFBEB';
        badgeText = '#92400E';
      }

      // Custom Leaflet DivIcon with pulsing hotspot ring
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            ${
              isHotspot
                ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ${markerRing}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                : ''
            }
            <div style="width: 26px; height: 26px; border-radius: 50%; background: ${markerColor}; border: 3px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1); display: flex; align-items: center; justify-content: center;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></span>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Popup Content
      const popupHtml = `
        <div style="min-width: 250px; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 12px; color: #1e293b;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 9999px; background: ${badgeBg}; color: ${badgeText}; border: 1px solid ${markerColor}40;">
              ${badgeLabel}
            </span>
            <span style="font-size: 10px; color: #64748b;">ID #${node.facility_id || node.id}</span>
          </div>

          <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 2px 0;">
            ${node.name}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 10px 0;">
            ${node.facility_type || 'Healthcare Facility'} — ${districtName}
          </p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748b;">Outbound Referrals:</span>
              <strong style="color: #0f172a;">${node.referral_count} records</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748b;">Active Gap Flags:</span>
              <strong style="color: ${node.gap_count > 0 ? '#dc2626' : '#0f172a'};">${node.gap_count} flagged</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 4px; margin-top: 4px;">
              <span style="color: #64748b;">Primary Shortage:</span>
              <strong style="color: #0f172a;">${node.primary_shortage || 'None'}</strong>
            </div>
          </div>

          <button
            id="popup-inspect-btn-${node.facility_id || node.id}"
            style="width: 100%; background: #0f172a; color: #ffffff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"
          >
            Inspect Shortage Evidence &rarr;
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-inspect-btn-${node.facility_id || node.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onInspectEvidence && node.facility_id) {
              onInspectEvidence(node.facility_id, node.name);
            }
          };
        }
      });

      marker.on('click', () => {
        setSelectedFacility(node);
      });

      marker.addTo(markersLayer);
    });

    // Auto-fit bounds if valid markers exist
    if (validCoordinates.length > 0) {
      const bounds = L.latLngBounds(validCoordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [filteredNodes, districtName, onInspectEvidence]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {/* Map Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <MapPin className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              District Geographical Resource Deficit Heat Map
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Leaflet &bull; OpenStreetMap
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Geographic facility coordinates across {districtName}. Markers indicate resource shortage status.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          {(['All', 'Equipment', 'Specialists', 'Beds'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              {cat === 'All' ? 'All Resources' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Actual Geographical Map Container */}
      <div className="relative">
        <div
          ref={mapContainerRef}
          style={{ height: '480px', width: '100%', zIndex: 10 }}
          className="bg-slate-100"
        />

        {/* Floating Quick Legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-md text-xs space-y-2 max-w-xs transition-colors">
          <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center space-x-1.5">
            <span>Facility Shortage Status</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 ring-4 ring-red-100 dark:ring-red-950/60 inline-block shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">
                <strong>Potential Gap</strong> (Repeated referrals for unavailable resource)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950/60 inline-block shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">
                <strong>Needs Review</strong> (Staff/equipment capacity discrepancy)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/60 inline-block shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">
                <strong>Normal</strong> (Reported available, baseline adequate)
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic pt-1 border-t border-slate-100 dark:border-slate-800">
            Click any pin to inspect facility details & evidence
          </p>
        </div>
      </div>

      {/* Map Sub-banner with Facility Quick Summary */}
      <div className="bg-slate-50 dark:bg-slate-800/60 px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />
          <span>
            Displaying <strong>{filteredNodes.length} facility nodes</strong> plotted with geographical coordinates in {districtName}.
          </span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          OpenStreetMap &bull; High-precision coordinate pinning
        </div>
      </div>
    </div>
  );
};
