'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3Geo from 'd3-geo';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';

const WORLD_TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

type CountryData = { country: string; countryName: string; count: number };

type Props = {
    data: CountryData[];
};

type CountryFeature = GeoJSON.Feature<GeoJSON.Geometry, { name: string }>;

export default function UserWorldMap({ data }: Props) {
    const svgRef = useRef<SVGSVGElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [worldData, setWorldData] = useState<CountryFeature[] | null>(null);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

    // Country code to numeric ID mapping (ISO 3166-1 numeric)
    const countryCodeToNumeric: Record<string, string[]> = useMemo(() => ({
        'AF': ['004'], 'AL': ['008'], 'DZ': ['012'], 'AD': ['020'], 'AO': ['024'],
        'AG': ['028'], 'AR': ['032'], 'AM': ['051'], 'AU': ['036'], 'AT': ['040'],
        'AZ': ['031'], 'BS': ['044'], 'BH': ['048'], 'BD': ['050'], 'BB': ['052'],
        'BY': ['112'], 'BE': ['056'], 'BZ': ['084'], 'BJ': ['204'], 'BT': ['064'],
        'BO': ['068'], 'BA': ['070'], 'BW': ['072'], 'BR': ['076'], 'BN': ['096'],
        'BG': ['100'], 'BF': ['854'], 'BI': ['108'], 'KH': ['116'], 'CM': ['120'],
        'CA': ['124'], 'CF': ['140'], 'TD': ['148'], 'CL': ['152'], 'CN': ['156'],
        'CO': ['170'], 'KM': ['174'], 'CD': ['180'], 'CG': ['178'], 'CR': ['188'],
        'CI': ['384'], 'HR': ['191'], 'CU': ['192'], 'CY': ['196'], 'CZ': ['203'],
        'DK': ['208'], 'DJ': ['262'], 'DM': ['212'], 'DO': ['214'], 'EC': ['218'],
        'EG': ['818'], 'SV': ['222'], 'GQ': ['226'], 'ER': ['232'], 'EE': ['233'],
        'ET': ['231'], 'FJ': ['242'], 'FI': ['246'], 'FR': ['250'], 'GA': ['266'],
        'GM': ['270'], 'GE': ['268'], 'DE': ['276'], 'GH': ['288'], 'GR': ['300'],
        'GT': ['320'], 'GN': ['324'], 'GW': ['624'], 'GY': ['328'], 'HT': ['332'],
        'HN': ['340'], 'HU': ['348'], 'IS': ['352'], 'IN': ['356'], 'ID': ['360'],
        'IR': ['364'], 'IQ': ['368'], 'IE': ['372'], 'IL': ['376'], 'IT': ['380'],
        'JM': ['388'], 'JP': ['392'], 'JO': ['400'], 'KZ': ['398'], 'KE': ['404'],
        'KP': ['408'], 'KR': ['410'], 'KW': ['414'], 'KG': ['417'], 'LA': ['418'],
        'LV': ['428'], 'LB': ['422'], 'LS': ['426'], 'LR': ['430'], 'LY': ['434'],
        'LT': ['440'], 'LU': ['442'], 'MK': ['807'], 'MG': ['450'], 'MW': ['454'],
        'MY': ['458'], 'ML': ['466'], 'MR': ['478'], 'MU': ['480'], 'MX': ['484'],
        'MD': ['498'], 'MN': ['496'], 'ME': ['499'], 'MA': ['504'], 'MZ': ['508'],
        'MM': ['104'], 'NA': ['516'], 'NP': ['524'], 'NL': ['528'], 'NZ': ['554'],
        'NI': ['558'], 'NE': ['562'], 'NG': ['566'], 'NO': ['578'], 'OM': ['512'],
        'PK': ['586'], 'PA': ['591'], 'PG': ['598'], 'PY': ['600'], 'PE': ['604'],
        'PH': ['608'], 'PL': ['616'], 'PT': ['620'], 'QA': ['634'], 'RO': ['642'],
        'RU': ['643'], 'RW': ['646'], 'SA': ['682'], 'SN': ['686'], 'RS': ['688'],
        'SL': ['694'], 'SG': ['702'], 'SK': ['703'], 'SI': ['705'], 'SO': ['706'],
        'ZA': ['710'], 'SS': ['728'], 'ES': ['724'], 'LK': ['144'], 'SD': ['729', '736'],
        'SR': ['740'], 'SZ': ['748'], 'SE': ['752'], 'CH': ['756'], 'SY': ['760'],
        'TW': ['158'], 'TJ': ['762'], 'TZ': ['834'], 'TH': ['764'], 'TL': ['626'],
        'TG': ['768'], 'TT': ['780'], 'TN': ['788'], 'TR': ['792'], 'TM': ['795'],
        'UG': ['800'], 'UA': ['804'], 'AE': ['784'], 'GB': ['826'], 'US': ['840'],
        'UY': ['858'], 'UZ': ['860'], 'VE': ['862'], 'VN': ['704'], 'YE': ['887'],
        'ZM': ['894'], 'ZW': ['716'], 'XK': ['-99'],
    }), []);

    useEffect(() => {
        fetch(WORLD_TOPO_URL)
            .then(res => res.json())
            .then((topology: Topology) => {
                const geojson = topojson.feature(
                    topology,
                    topology.objects.countries as GeometryCollection
                ) as unknown as GeoJSON.FeatureCollection;
                setWorldData(geojson.features as CountryFeature[]);
            });
    }, []);

    const countByNumericId = useMemo(() => {
        const map = new Map<string, { count: number; name: string }>();
        for (const d of data) {
            const numericIds = countryCodeToNumeric[d.country];
            if (numericIds) {
                for (const id of numericIds) {
                    map.set(id, { count: d.count, name: d.countryName });
                }
            }
        }
        return map;
    }, [data, countryCodeToNumeric]);

    const maxCount = useMemo(() => Math.max(...data.map(d => d.count), 1), [data]);

    const getColor = (count: number): string => {
        if (count === 0) return '#1a1a2e';
        const intensity = Math.log(count + 1) / Math.log(maxCount + 1);
        const r = Math.round(30 + intensity * (139 - 30));
        const g = Math.round(30 + intensity * (92 - 30));
        const b = Math.round(46 + intensity * (246 - 46));
        return `rgb(${r}, ${g}, ${b})`;
    };

    const width = 900;
    const height = 450;
    const projection = d3Geo.geoNaturalEarth1().fitSize([width, height], { type: 'Sphere' });
    const pathGenerator = d3Geo.geoPath().projection(projection);

    if (!worldData) {
        return <div className="min-h-[400px] flex items-center justify-center text-gray-400">Loading map...</div>;
    }

    return (
        <div className="relative">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto"
                style={{ maxHeight: '450px' }}
            >
                <rect width={width} height={height} fill="#0d0d1a" rx={8} />
                {worldData.map((feature, i) => {
                    const id = (feature as unknown as { id: string }).id;
                    const match = countByNumericId.get(id);
                    const count = match?.count ?? 0;
                    const path = pathGenerator(feature) ?? '';

                    return (
                        <path
                            key={i}
                            d={path}
                            fill={getColor(count)}
                            stroke="#2a2a3e"
                            strokeWidth={0.5}
                            className="transition-colors duration-200 hover:brightness-150 cursor-pointer"
                            onMouseEnter={(e) => {
                                const name = match?.name ?? feature.properties?.name ?? 'Unknown';
                                const rect = svgRef.current?.getBoundingClientRect();
                                if (rect) {
                                    setTooltip({
                                        x: e.clientX - rect.left,
                                        y: e.clientY - rect.top - 10,
                                        content: `${name}: ${count} user${count !== 1 ? 's' : ''}`,
                                    });
                                }
                            }}
                            onMouseMove={(e) => {
                                const rect = svgRef.current?.getBoundingClientRect();
                                if (rect && tooltip) {
                                    setTooltip(prev => prev ? {
                                        ...prev,
                                        x: e.clientX - rect.left,
                                        y: e.clientY - rect.top - 10,
                                    } : null);
                                }
                            }}
                            onMouseLeave={() => setTooltip(null)}
                        />
                    );
                })}
            </svg>
            {tooltip && (
                <div
                    ref={tooltipRef}
                    className="absolute pointer-events-none bg-dark-100 border border-dark-200 text-default text-sm px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-50"
                    style={{
                        left: `${tooltip.x}px`,
                        top: `${tooltip.y}px`,
                        transform: 'translate(-50%, -100%)',
                    }}
                >
                    {tooltip.content}
                </div>
            )}
            {data.length > 0 && (
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 justify-end">
                    <span>Fewer</span>
                    <div className="flex gap-0.5">
                        {[0.1, 0.3, 0.5, 0.7, 1].map((v, i) => (
                            <div key={i} className="w-5 h-3 rounded-sm" style={{ backgroundColor: getColor(Math.round(v * maxCount)) }} />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            )}
        </div>
    );
}
