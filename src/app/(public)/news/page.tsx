'use client'

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ptBR } from "date-fns/locale";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type NewsApiItem = {
  id: number;
  title: string;
  description: string;
  content?: string;
  news_date?: string;
  created_at?: string;
  images?: Array<{
    id?: number;
    image_url?: string;
    caption?: string | null;
  }>;
};

type EventApiItem = {
  id: number;
  title: string;
  description: string;
  event_date?: string;
  created_at?: string;
  images?: Array<{
    id?: number;
    image_url?: string;
    caption?: string | null;
  }>;
};

type FeedKind = "news" | "event";
type FilterKind = "all" | FeedKind;

type FeedItem = {
  id: string;
  originalId: number;
  kind: FeedKind;
  typeLabel: "Notícia" | "Evento";
  title: string;
  description: string;
  date: string;
  image: string;
  href: string;
  actionLabel: string;
};

type DateInfo = {
  newsTitles: string[];
  eventTitles: string[];
};

const ITEMS_PER_PAGE = 3;

const FALLBACK_IMAGES = [
  "/imgpadrao2.jpg",
  "/imgpadrao3.jpg",
  "/teste.jpg",
];

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getSafeDate(value?: string) {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function formatLongDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getFallbackImage(index: number) {
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function buildFeed(news: NewsApiItem[], events: EventApiItem[]) {
  const mappedNews: FeedItem[] = news.map((item, index) => ({
    id: `news-${item.id}`,
    originalId: item.id,
    kind: "news",
    typeLabel: "Notícia",
    title: item.title,
    description: item.description,
    date: getSafeDate(item.news_date ?? item.created_at),
    image: item.images?.[0]?.image_url || getFallbackImage(index),
    href: `/news/news-${item.id}`,
    actionLabel: "Leia mais",
  }));

  const mappedEvents: FeedItem[] = events.map((item, index) => ({
    id: `event-${item.id}`,
    originalId: item.id,
    kind: "event",
    typeLabel: "Evento",
    title: item.title,
    description: item.description,
    date: getSafeDate(item.event_date ?? item.created_at),
    image: item.images?.[0]?.image_url || getFallbackImage(index + mappedNews.length),
    href: `/news/event-${item.id}`,
    actionLabel: "Leia mais",
  }));

  return [...mappedNews, ...mappedEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

function mapEventToFeaturedItem(item: EventApiItem, index: number): FeedItem {
  return {
    id: `event-${item.id}`,
    originalId: item.id,
    kind: "event",
    typeLabel: "Evento",
    title: item.title,
    description: item.description,
    date: getSafeDate(item.event_date ?? item.created_at),
    image: item.images?.[0]?.image_url || getFallbackImage(index),
    href: `/news/event-${item.id}`,
    actionLabel: "Leia mais",
  };
}

function getClosestFeaturedEvent(events: EventApiItem[]) {
  if (events.length === 0) {
    return undefined;
  }

  const now = new Date();

  const validEvents = events.filter((event) => {
    const eventDate = new Date(getSafeDate(event.event_date ?? event.created_at));
    return !Number.isNaN(eventDate.getTime());
  });

  if (validEvents.length === 0) {
    return undefined;
  }

  const upcomingEvents = validEvents.filter((event) => {
    const eventDate = new Date(getSafeDate(event.event_date ?? event.created_at));
    return eventDate.getTime() >= now.getTime();
  });

  const source = upcomingEvents.length > 0 ? upcomingEvents : validEvents;

  return [...source].sort((first, second) => {
    const firstDate = new Date(getSafeDate(first.event_date ?? first.created_at)).getTime();
    const secondDate = new Date(getSafeDate(second.event_date ?? second.created_at)).getTime();

    const firstDistance =
      upcomingEvents.length > 0
        ? firstDate - now.getTime()
        : Math.abs(firstDate - now.getTime());
    const secondDistance =
      upcomingEvents.length > 0
        ? secondDate - now.getTime()
        : Math.abs(secondDate - now.getTime());

    if (firstDistance !== secondDistance) {
      return firstDistance - secondDistance;
    }

    const firstCreatedAt = new Date(getSafeDate(first.created_at)).getTime();
    const secondCreatedAt = new Date(getSafeDate(second.created_at)).getTime();

    if (firstCreatedAt !== secondCreatedAt) {
      return firstCreatedAt - secondCreatedAt;
    }

    return first.id - second.id;
  })[0];
}

function buildDateLookup(items: FeedItem[]) {
  return items.reduce<Record<string, DateInfo>>((accumulator, item) => {
    const key = formatDateKey(new Date(item.date));

    if (!accumulator[key]) {
      accumulator[key] = {
        newsTitles: [],
        eventTitles: [],
      };
    }

    if (item.kind === "news") {
      accumulator[key].newsTitles.push(item.title);
    } else {
      accumulator[key].eventTitles.push(item.title);
    }

    return accumulator;
  }, {});
}

function getTooltipForDate(info?: DateInfo) {
  if (!info) {
    return undefined;
  }

  const lines: string[] = [];

  if (info.newsTitles.length > 0) {
    lines.push(`Notícias: ${info.newsTitles.join(", ")}`);
  }

  if (info.eventTitles.length > 0) {
    lines.push(`Eventos: ${info.eventTitles.join(", ")}`);
  }

  return lines.join("\n");
}

function PaginationButton({
  disabled,
  active,
  children,
  onClick,
}: {
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex h-10 min-w-10 items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.98] sm:h-11 sm:min-w-11",
        active
          ? "border-[#0b73e0] bg-[#0b73e0] text-white shadow-sm"
          : "border-[#dbe7f3] bg-[#eef4fb] text-slate-700 hover:border-[#bfd5ee] hover:bg-[#e4eef9] hover:shadow-sm",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function NewsPage() {
  const [selectedFilter, setSelectedFilter] = useState<FilterKind>("all");
  const [search, setSearch] = useState("");
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredEvent, setFeaturedEvent] = useState<FeedItem | undefined>(undefined);

  useEffect(() => {
    async function loadFeed() {
      try {
        const [newsResponse, eventsResponse] = await Promise.all([
          fetch("/api/news"),
          fetch("/api/events"),
        ]);

        const [newsData, eventsData] = await Promise.all([
          newsResponse.ok ? newsResponse.json() : [],
          eventsResponse.ok ? eventsResponse.json() : [],
        ]);

        const merged = buildFeed(newsData, eventsData);
        const closestEvent = getClosestFeaturedEvent(eventsData);
        setFeed(merged);
        setFeaturedEvent(
          closestEvent ? mapEventToFeaturedItem(closestEvent, 0) : undefined
        );

        if (merged[0]) {
          const firstDate = new Date(merged[0].date);
          setCalendarMonth(firstDate);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadFeed();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, search, selectedDate]);

  const dateLookup = useMemo(() => buildDateLookup(feed), [feed]);

  const filteredFeed = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return feed.filter((item) => {
      const matchesFilter = selectedFilter === "all" || item.kind === selectedFilter;
      const searchBase = `${item.title} ${item.description} ${item.typeLabel} ${
        item.kind === "news" ? "notícias notícia" : "eventos evento"
      }`.toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 || searchBase.includes(normalizedSearch);
      const matchesDate =
        !selectedDate ||
        new Date(item.date).toDateString() === selectedDate.toDateString();

      return matchesFilter && matchesSearch && matchesDate;
    });
  }, [feed, search, selectedDate, selectedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredFeed.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedFeed = filteredFeed.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );
  const paginationItems = Array.from({ length: totalPages }, (_, index) => index + 1);
  const highlightedDates = Object.keys(dateLookup).map((key) => new Date(`${key}T12:00:00`));

  return (
    <section className="min-h-screen bg-[#f7f9fc] px-4 py-8 md:px-8 md:py-10 xl:px-12">
      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-8 md:gap-10">
        <div className="flex flex-col gap-6 rounded-[24px] border border-[#e2ebf4] bg-white px-4 py-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.28)] sm:px-5 sm:py-8 md:gap-8 md:px-8 xl:px-10">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                Notícias e Eventos
              </h1>
            </div>

            <label className="group flex h-14 w-full max-w-full items-center gap-3 rounded-2xl border border-[#d8e5f1] bg-[#eff5fb] px-4 text-slate-500 shadow-inner transition-all duration-200 ease-out hover:border-[#bfd5ee] hover:bg-[#f3f8fd] focus-within:border-[#93c5fd] focus-within:bg-white focus-within:shadow-md focus-within:ring-4 focus-within:ring-blue-100 xl:max-w-[390px]">
              <Search className="size-5 text-[#326aa5]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pesquisar"
                className="h-full w-full bg-transparent text-base text-slate-700 outline-none placeholder:text-[#5f7ea3]"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { label: "Notícias", value: "news" as const },
              { label: "Eventos", value: "event" as const },
            ].map((item) => {
              const active = selectedFilter === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setSelectedFilter((current) =>
                      current === item.value ? "all" : item.value
                    )
                  }
                  className={cn(
                    buttonVariants({
                      variant: active ? "default" : "secondary",
                    }),
                    [
                    "h-auto rounded-full px-4 py-2 text-sm sm:px-5 sm:py-3 sm:text-base",
                    active
                      ? "bg-[#d9eafc] text-[#0b73e0] hover:bg-[#cfe4fb]"
                      : "bg-[#eef3f8] text-slate-700 hover:bg-[#e2ebf8]",
                  ].join(" "))
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-10 xl:grid-cols-[minmax(0,1.9fr)_440px]">
          <div className="space-y-8">
            {isLoading ? (
              <div className="rounded-[24px] border border-[#dfe8f1] bg-white px-8 py-16 text-center text-lg text-slate-500">
                Carregando conteúdo...
              </div>
            ) : paginatedFeed.length === 0 ? (
              <div className="rounded-[24px] border border-[#dfe8f1] bg-white px-8 py-16 text-center text-lg text-slate-500">
                Nenhum conteúdo encontrado para os filtros atuais.
              </div>
            ) : (
              paginatedFeed.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-6 rounded-[24px] border border-[#dfe8f1] bg-white p-4 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.35)] sm:p-5 md:grid-cols-[minmax(0,1.2fr)_320px] md:p-7"
                >
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:gap-4">
                        <p className="text-[15px] text-[#326aa5]">
                          {formatLongDate(item.date)}
                        </p>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.08em]",
                            item.kind === "news"
                              ? "bg-[#dcecff] text-[#0b73e0]"
                              : "bg-[#dcf5e5] text-[#15803d]"
                          )}
                        >
                          {item.typeLabel}
                        </span>
                      </div>
                      <h2 className="max-w-3xl text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
                        {item.title}
                      </h2>
                      <p className="mt-4 max-w-3xl text-base leading-7 text-[#3d6696] sm:mt-5 sm:text-[18px] sm:leading-9">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-8">
                      <Button
                        asChild
                        type="button"
                        variant="secondary"
                        className="h-12 w-full rounded-2xl bg-[#eef3f8] px-6 text-base font-medium text-slate-900 hover:bg-[#dfe9f5] sm:w-auto sm:text-lg"
                      >
                        <Link href={item.href}>{item.actionLabel}</Link>
                      </Button>
                    </div>
                  </div>

                  <Link
                    href={item.href}
                    className="relative aspect-[1.05/1] overflow-hidden rounded-[20px] border border-[#d9e5f0] bg-[#edf3f8]"
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 320px"
                    />
                  </Link>
                </article>
              ))
            )}

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <PaginationButton
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  <ChevronLeft className="size-4" />
                </PaginationButton>

                {paginationItems.slice(0, 5).map((page) => (
                  <PaginationButton
                    key={page}
                    active={page === safePage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationButton>
                ))}

                {totalPages > 5 && (
                  <>
                    <span className="px-1 text-slate-500">...</span>
                    <PaginationButton
                      active={safePage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </PaginationButton>
                  </>
                )}

                <PaginationButton
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  <ChevronRight className="size-4" />
                </PaginationButton>
              </div>
            )}
          </div>

          <aside className="min-w-0 space-y-8">
            <div className="rounded-[24px] border border-[#dfe8f1] bg-white p-4 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.35)] sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-[#e8f1fb] p-3 text-[#0b73e0]">
                  <CalendarDays className="size-5" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Calendário
                </h3>
              </div>

              <Calendar
                mode="single"
                locale={ptBR}
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{ highlighted: highlightedDates }}
                formatters={{
                  formatCaption: (date) =>
                    date.toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    }),
                  formatWeekdayName: (date) =>
                    date
                      .toLocaleDateString("pt-BR", { weekday: "short" })
                      .replace(".", "")
                      .slice(0, 3),
                }}
                className="w-full rounded-2xl border border-[#edf2f7] bg-[#fbfdff] p-3"
                classNames={{
                  root: "w-full",
                  months: "relative w-full",
                  month: "w-full space-y-4",
                  nav: "absolute inset-x-0 top-0 z-10 flex items-center justify-between px-1",
                  month_caption: "flex h-10 items-center justify-center px-10 sm:px-12",
                  caption_label: "text-center text-base font-bold capitalize text-slate-900 sm:text-lg",
                  table: "w-full",
                  weekdays: "grid grid-cols-7 gap-y-2",
                  weekday: "flex h-8 items-center justify-center text-xs font-medium uppercase tracking-[0.04em] text-[#6b85a6] sm:h-9 sm:text-sm",
                  week: "grid grid-cols-7",
                  day: "flex items-center justify-center p-0.5 sm:p-1",
                  button_previous:
                    "flex size-9 items-center justify-center rounded-full border border-[#e1ebf5] bg-white text-slate-700 hover:bg-[#eff5fb]",
                  button_next:
                    "flex size-9 items-center justify-center rounded-full border border-[#e1ebf5] bg-white text-slate-700 hover:bg-[#eff5fb]",
                }}
                components={{
                  DayButton: (props) => {
                    const key = formatDateKey(props.day.date);
                    const info = dateLookup[key];
                    const hasNews = Boolean(info?.newsTitles.length);
                    const hasEvent = Boolean(info?.eventTitles.length);

                    return (
                      <CalendarDayButton
                        {...props}
                        title={getTooltipForDate(info)}
                        className={cn(
                          "h-9 w-9 rounded-full text-sm font-medium sm:h-11 sm:w-11 sm:text-[15px]",
                          props.className,
                          hasNews &&
                            !hasEvent &&
                            "bg-[#dcecff] text-[#0b73e0] hover:bg-[#cfe4ff]",
                          hasEvent &&
                            !hasNews &&
                            "bg-[#dcf5e5] text-[#15803d] hover:bg-[#ccedd9]",
                          hasNews &&
                            hasEvent &&
                            "bg-[linear-gradient(135deg,#dcecff_0%,#dcecff_50%,#dcf5e5_50%,#dcf5e5_100%)] text-slate-900 hover:opacity-90"
                        )}
                      />
                    );
                  },
                }}
              />

              <button
                type="button"
                onClick={() => setSelectedDate(undefined)}
                className="mt-4 text-sm font-semibold text-[#0b73e0] transition-colors duration-200 hover:text-[#095aba]"
              >
                Limpar seleção de data
              </button>
            </div>

            <div className="rounded-[24px] border border-[#dfe8f1] bg-white p-4 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.35)] sm:p-7">
              <h3 className="text-2xl font-extrabold text-slate-900">Em Destaque</h3>

              {featuredEvent ? (
                <div className="mt-6">
                  <Link
                    href={featuredEvent.href}
                    className="relative block aspect-[1.26/1] overflow-hidden rounded-[20px] border border-[#d9e5f0] bg-[#edf3f8]"
                  >
                    <Image
                      src={featuredEvent.image}
                      alt={featuredEvent.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1280px) 100vw, 360px"
                    />
                  </Link>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <p className="text-[15px] text-[#326aa5]">
                      {formatShortDate(featuredEvent.date)}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.08em]",
                        featuredEvent.kind === "news"
                          ? "bg-[#dcecff] text-[#0b73e0]"
                          : "bg-[#dcf5e5] text-[#15803d]"
                      )}
                    >
                      {featuredEvent.typeLabel}
                    </span>
                  </div>
                  <h4 className="mt-3 text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">
                    {featuredEvent.title}
                  </h4>
                  <p className="mt-4 text-base leading-7 text-[#3d6696] sm:text-[18px] sm:leading-8">
                    {featuredEvent.description}
                  </p>

                  <Button
                    asChild
                    type="button"
                    variant="link"
                    className="mt-5 h-auto px-0 text-lg font-semibold text-[#0b73e0]"
                  >
                    <Link href={featuredEvent.href}>
                      {featuredEvent.actionLabel}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="mt-4 text-slate-500">Ainda não há conteúdo em destaque.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
