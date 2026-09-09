"use client";

import { useMemo, useState } from "react";
import type { ItineraryItem, Location, LocationType, RouteLeg, TransportType } from "@/types/trip";
import { SectionTitle } from "@/components/SectionTitle";
import { useTrip } from "@/components/TripProvider";

const locationTypes: { value: LocationType; label: string }[] = [
  { value: "airport", label: "机场" },
  { value: "hotel", label: "酒店" },
  { value: "attraction", label: "景点" },
  { value: "restaurant", label: "餐厅" },
  { value: "city", label: "城市" },
  { value: "other", label: "其他" },
];

const transportTypes: { value: TransportType; label: string }[] = [
  { value: "flight", label: "飞机" },
  { value: "highSpeedRail", label: "高铁" },
  { value: "train", label: "火车" },
  { value: "metro", label: "地铁" },
  { value: "bus", label: "公交" },
  { value: "walk", label: "步行" },
  { value: "taxi", label: "出租车" },
  { value: "other", label: "其他" },
];

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-[var(--color-border)] bg-white p-5 md:p-6">
      <h4 className="text-lg font-semibold text-[var(--color-text)]">{title}</h4>
      <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</span>
      {children}
    </label>
  );
}

function inputClassName() {
  return "min-h-10 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]";
}

export function PlannerEditorSection() {
  const {
    trip,
    resetTrip,
    updateBasicInfo,
    upsertLocation,
    deleteLocation,
    upsertRoute,
    deleteRoute,
    addItineraryDay,
    updateItineraryDay,
    deleteItineraryDay,
    upsertItineraryItem,
    deleteItineraryItem,
  } = useTrip();

  const [overview, setOverview] = useState({
    title: trip.basicInfo.title,
    origin: trip.basicInfo.origin,
    destination: trip.basicInfo.destination,
    startDate: trip.basicInfo.startDate,
    endDate: trip.basicInfo.endDate,
    description: trip.basicInfo.description,
  });

  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [locationDraft, setLocationDraft] = useState<Location>({
    id: newId("loc"),
    name: "",
    type: "attraction",
    address: "",
    latitude: 13.75,
    longitude: 100.5,
    image: "",
    description: "",
    openingHours: "",
    ticketPrice: "",
    notes: "",
  });

  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [routeDraft, setRouteDraft] = useState<RouteLeg>({
    id: newId("route"),
    from: "",
    to: "",
    transport: "taxi",
    departureTime: "09:00",
    arrivalTime: "10:00",
    duration: "1小时",
    distance: "约 10 公里",
    notes: "",
    fromLocationId: undefined,
    toLocationId: undefined,
  });

  const [itemDay, setItemDay] = useState<number>(trip.itinerary[0]?.day ?? 1);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState<ItineraryItem>({
    id: newId("item"),
    time: "09:00",
    locationId: trip.locations[0]?.id ?? "",
    title: "",
    description: "",
    duration: "1小时",
    transport: "walk",
    image: "",
    notes: "",
  });

  const dayData = useMemo(() => {
    return trip.itinerary.find((day) => day.day === itemDay) ?? trip.itinerary[0] ?? null;
  }, [trip.itinerary, itemDay]);

  const onSaveOverview = () => {
    updateBasicInfo(overview);
  };

  const resetLocationDraft = () => {
    setEditingLocationId(null);
    setLocationDraft({
      id: newId("loc"),
      name: "",
      type: "attraction",
      address: "",
      latitude: 13.75,
      longitude: 100.5,
      image: "",
      description: "",
      openingHours: "",
      ticketPrice: "",
      notes: "",
    });
  };

  const onSaveLocation = () => {
    if (!locationDraft.name.trim()) return;
    upsertLocation({
      ...locationDraft,
      name: locationDraft.name.trim(),
      address: locationDraft.address.trim(),
      description: locationDraft.description.trim(),
      notes: locationDraft.notes.trim(),
    });
    resetLocationDraft();
  };

  const onEditLocation = (location: Location) => {
    setEditingLocationId(location.id);
    setLocationDraft(location);
  };

  const resetRouteDraft = () => {
    setEditingRouteId(null);
    setRouteDraft({
      id: newId("route"),
      from: "",
      to: "",
      transport: "taxi",
      departureTime: "09:00",
      arrivalTime: "10:00",
      duration: "1小时",
      distance: "约 10 公里",
      notes: "",
      fromLocationId: undefined,
      toLocationId: undefined,
    });
  };

  const onSaveRoute = () => {
    if (!routeDraft.from.trim() || !routeDraft.to.trim()) return;
    upsertRoute({
      ...routeDraft,
      from: routeDraft.from.trim(),
      to: routeDraft.to.trim(),
      notes: routeDraft.notes.trim(),
    });
    resetRouteDraft();
  };

  const onEditRoute = (route: RouteLeg) => {
    setEditingRouteId(route.id);
    setRouteDraft(route);
  };

  const resetItemDraft = (day: number) => {
    setEditingItemId(null);
    setItemDay(day);
    setItemDraft({
      id: newId("item"),
      time: "09:00",
      locationId: trip.locations[0]?.id ?? "",
      title: "",
      description: "",
      duration: "1小时",
      transport: "walk",
      image: "",
      notes: "",
    });
  };

  const onSaveItem = () => {
    if (!itemDraft.title.trim() || !itemDraft.locationId) return;
    upsertItineraryItem(itemDay, {
      ...itemDraft,
      title: itemDraft.title.trim(),
      description: itemDraft.description.trim(),
      notes: itemDraft.notes.trim(),
    });
    resetItemDraft(itemDay);
  };

  const onEditItem = (day: number, item: ItineraryItem) => {
    setItemDay(day);
    setEditingItemId(item.id);
    setItemDraft(item);
  };

  return (
    <section id="manage" className="scroll-mt-40 space-y-6">
      <SectionTitle
        eyebrow="数据管理"
        title="行程内容 CRUD"
        description="这里可以直接编辑旅行计划数据（概览、地点、路线、每日安排），所有修改会自动保存在浏览器本地。"
      />

      <div className="grid gap-6">
        <Panel title="1) 行程概览" description="用于更新页面顶部标题、日期、出发地、目的地与介绍文案。">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="行程标题">
              <input className={inputClassName()} value={overview.title} onChange={(e) => setOverview((p) => ({ ...p, title: e.target.value }))} />
            </Field>
            <Field label="出发地">
              <input className={inputClassName()} value={overview.origin} onChange={(e) => setOverview((p) => ({ ...p, origin: e.target.value }))} />
            </Field>
            <Field label="目的地">
              <input className={inputClassName()} value={overview.destination} onChange={(e) => setOverview((p) => ({ ...p, destination: e.target.value }))} />
            </Field>
            <Field label="开始日期">
              <input className={inputClassName()} value={overview.startDate} onChange={(e) => setOverview((p) => ({ ...p, startDate: e.target.value }))} />
            </Field>
            <Field label="结束日期">
              <input className={inputClassName()} value={overview.endDate} onChange={(e) => setOverview((p) => ({ ...p, endDate: e.target.value }))} />
            </Field>
            <Field label="描述文案">
              <textarea
                className={`${inputClassName()} min-h-20 py-2.5`}
                value={overview.description}
                onChange={(e) => setOverview((p) => ({ ...p, description: e.target.value }))}
              />
            </Field>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={onSaveOverview} className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white">
              保存概览
            </button>
            <button
              type="button"
              onClick={() =>
                setOverview({
                  title: trip.basicInfo.title,
                  origin: trip.basicInfo.origin,
                  destination: trip.basicInfo.destination,
                  startDate: trip.basicInfo.startDate,
                  endDate: trip.basicInfo.endDate,
                  description: trip.basicInfo.description,
                })
              }
              className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm"
            >
              还原输入
            </button>
            <button type="button" onClick={resetTrip} className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)]">
              重置全部为默认数据
            </button>
          </div>
        </Panel>

        <Panel title="2) 地点清单（增删改）" description="新增或编辑地点后，路线与每日安排会自动使用更新后的地点信息。">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="地点名称">
              <input className={inputClassName()} value={locationDraft.name} onChange={(e) => setLocationDraft((p) => ({ ...p, name: e.target.value }))} />
            </Field>
            <Field label="地点类型">
              <select
                className={inputClassName()}
                value={locationDraft.type}
                onChange={(e) => setLocationDraft((p) => ({ ...p, type: e.target.value as LocationType }))}
              >
                {locationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="地址">
              <input className={inputClassName()} value={locationDraft.address} onChange={(e) => setLocationDraft((p) => ({ ...p, address: e.target.value }))} />
            </Field>
            <Field label="纬度">
              <input
                type="number"
                step="0.0001"
                className={inputClassName()}
                value={locationDraft.latitude}
                onChange={(e) => setLocationDraft((p) => ({ ...p, latitude: Number(e.target.value) || 0 }))}
              />
            </Field>
            <Field label="经度">
              <input
                type="number"
                step="0.0001"
                className={inputClassName()}
                value={locationDraft.longitude}
                onChange={(e) => setLocationDraft((p) => ({ ...p, longitude: Number(e.target.value) || 0 }))}
              />
            </Field>
            <Field label="备注">
              <input className={inputClassName()} value={locationDraft.notes} onChange={(e) => setLocationDraft((p) => ({ ...p, notes: e.target.value }))} />
            </Field>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={onSaveLocation} className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white">
              {editingLocationId ? "更新地点" : "新增地点"}
            </button>
            <button type="button" onClick={resetLocationDraft} className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm">
              清空表单
            </button>
          </div>

          <div className="mt-4 grid gap-2">
            {trip.locations.map((location) => (
              <div key={location.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{location.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{location.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => onEditLocation(location)} className="rounded-lg border border-[var(--color-border)] px-2.5 py-1 text-xs">
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteLocation(location.id)}
                    className="rounded-lg border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="3) 路线（#route）管理" description="支持新增、编辑、删除路线段；可关联起点/终点地点，地图会自动绘制线路。">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="出发地名称">
              <input className={inputClassName()} value={routeDraft.from} onChange={(e) => setRouteDraft((p) => ({ ...p, from: e.target.value }))} />
            </Field>
            <Field label="目的地名称">
              <input className={inputClassName()} value={routeDraft.to} onChange={(e) => setRouteDraft((p) => ({ ...p, to: e.target.value }))} />
            </Field>
            <Field label="交通方式">
              <select
                className={inputClassName()}
                value={routeDraft.transport}
                onChange={(e) => setRouteDraft((p) => ({ ...p, transport: e.target.value as TransportType }))}
              >
                {transportTypes.map((transport) => (
                  <option key={transport.value} value={transport.value}>
                    {transport.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="时段（出发-到达）">
              <div className="grid grid-cols-2 gap-2">
                <input className={inputClassName()} value={routeDraft.departureTime} onChange={(e) => setRouteDraft((p) => ({ ...p, departureTime: e.target.value }))} />
                <input className={inputClassName()} value={routeDraft.arrivalTime} onChange={(e) => setRouteDraft((p) => ({ ...p, arrivalTime: e.target.value }))} />
              </div>
            </Field>
            <Field label="时长">
              <input className={inputClassName()} value={routeDraft.duration} onChange={(e) => setRouteDraft((p) => ({ ...p, duration: e.target.value }))} />
            </Field>
            <Field label="距离">
              <input className={inputClassName()} value={routeDraft.distance} onChange={(e) => setRouteDraft((p) => ({ ...p, distance: e.target.value }))} />
            </Field>
            <Field label="起点地点 ID 绑定（可空）">
              <select
                className={inputClassName()}
                value={routeDraft.fromLocationId ?? ""}
                onChange={(e) => setRouteDraft((p) => ({ ...p, fromLocationId: e.target.value || undefined }))}
              >
                <option value="">不绑定</option>
                {trip.locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="终点地点 ID 绑定（可空）">
              <select
                className={inputClassName()}
                value={routeDraft.toLocationId ?? ""}
                onChange={(e) => setRouteDraft((p) => ({ ...p, toLocationId: e.target.value || undefined }))}
              >
                <option value="">不绑定</option>
                {trip.locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="备注">
              <input className={inputClassName()} value={routeDraft.notes} onChange={(e) => setRouteDraft((p) => ({ ...p, notes: e.target.value }))} />
            </Field>
          </div>

          <div className="mt-3 flex gap-2">
            <button type="button" onClick={onSaveRoute} className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white">
              {editingRouteId ? "更新路线" : "新增路线"}
            </button>
            <button type="button" onClick={resetRouteDraft} className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm">
              清空表单
            </button>
          </div>

          <div className="mt-4 grid gap-2">
            {trip.routes.map((route) => (
              <div key={route.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {route.from} → {route.to}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {route.departureTime} - {route.arrivalTime} · {route.duration} · {route.distance}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => onEditRoute(route)} className="rounded-lg border border-[var(--color-border)] px-2.5 py-1 text-xs">
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRoute(route.id)}
                    className="rounded-lg border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="4) 每日安排（增删改）" description="可新增/删除天数、编辑每天元信息（日期/城市/天气）及该天的行程条目。">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {trip.itinerary.map((day) => (
              <button
                key={day.day}
                type="button"
                onClick={() => setItemDay(day.day)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  day.day === itemDay
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)]"
                }`}
              >
                第 {String(day.day).padStart(2, "0")} 天
              </button>
            ))}
            <button type="button" onClick={addItineraryDay} className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs">
              + 新增一天
            </button>
          </div>

          {dayData ? (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="日期">
                  <input
                    className={inputClassName()}
                    value={dayData.date}
                    onChange={(e) => updateItineraryDay(dayData.day, { date: e.target.value })}
                  />
                </Field>
                <Field label="城市">
                  <input
                    className={inputClassName()}
                    value={dayData.city}
                    onChange={(e) => updateItineraryDay(dayData.day, { city: e.target.value })}
                  />
                </Field>
                <Field label="天气">
                  <input
                    className={inputClassName()}
                    value={dayData.weather}
                    onChange={(e) => updateItineraryDay(dayData.day, { weather: e.target.value })}
                  />
                </Field>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => deleteItineraryDay(dayData.day)}
                  className="rounded-xl border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)]"
                >
                  删除第 {String(dayData.day).padStart(2, "0")} 天
                </button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <Field label="时间">
                  <input className={inputClassName()} value={itemDraft.time} onChange={(e) => setItemDraft((p) => ({ ...p, time: e.target.value }))} />
                </Field>
                <Field label="地点">
                  <select
                    className={inputClassName()}
                    value={itemDraft.locationId}
                    onChange={(e) => setItemDraft((p) => ({ ...p, locationId: e.target.value }))}
                  >
                    <option value="">请选择地点</option>
                    {trip.locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="标题">
                  <input className={inputClassName()} value={itemDraft.title} onChange={(e) => setItemDraft((p) => ({ ...p, title: e.target.value }))} />
                </Field>
                <Field label="时长">
                  <input className={inputClassName()} value={itemDraft.duration} onChange={(e) => setItemDraft((p) => ({ ...p, duration: e.target.value }))} />
                </Field>
                <Field label="交通方式">
                  <select
                    className={inputClassName()}
                    value={itemDraft.transport}
                    onChange={(e) => setItemDraft((p) => ({ ...p, transport: e.target.value as TransportType }))}
                  >
                    {transportTypes.map((transport) => (
                      <option key={transport.value} value={transport.value}>
                        {transport.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="描述">
                  <input className={inputClassName()} value={itemDraft.description} onChange={(e) => setItemDraft((p) => ({ ...p, description: e.target.value }))} />
                </Field>
                <Field label="备注">
                  <input className={inputClassName()} value={itemDraft.notes} onChange={(e) => setItemDraft((p) => ({ ...p, notes: e.target.value }))} />
                </Field>
              </div>

              <div className="mt-3 flex gap-2">
                <button type="button" onClick={onSaveItem} className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white">
                  {editingItemId ? "更新行程项" : "新增行程项"}
                </button>
                <button type="button" onClick={() => resetItemDraft(dayData.day)} className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm">
                  清空表单
                </button>
              </div>

              <div className="mt-4 grid gap-2">
                {dayData.items.map((item) => {
                  const locationName = trip.locations.find((x) => x.id === item.locationId)?.name ?? "未知地点";
                  return (
                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text)]">
                          {item.time} · {item.title}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {locationName} · {item.duration}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEditItem(dayData.day, item)}
                          className="rounded-lg border border-[var(--color-border)] px-2.5 py-1 text-xs"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItineraryItem(dayData.day, item.id)}
                          className="rounded-lg border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </Panel>
      </div>
    </section>
  );
}
