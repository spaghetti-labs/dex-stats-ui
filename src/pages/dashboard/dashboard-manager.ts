import { id } from "date-fns/locale";
import * as _ from "lodash"
import { Layout } from "react-grid-layout"
import { v4 as uuidV4 } from "uuid";

export interface WidgetData {
  layout: Layout
  type: string
  payload: Record<string, any>
}

export interface Dashboard {
  title: string
  id: string
  widgets: WidgetData[]
}

export class DashboardManager {
  private dashboards: Dashboard[]
  private localStorageKey = 'dex-stats-api/ui/dashboards'
  private listeners: Array<() => void> = []
  constructor() {
    this.load();
    window.addEventListener('storage', e => {
      if (e.key === this.localStorageKey) {
        this.load();
      }
    })
  }

  load() {
    const json = localStorage.getItem(this.localStorageKey)
    if (json == null) {
      this.dashboards = []
    } else {
      this.dashboards = JSON.parse(json)
    }
    this.notify()
  
  }

  private pickDashboard(id: string): Dashboard {
    const dashboard = this.dashboards.find(dashboard => dashboard.id === id)
    if (dashboard == null) {
      throw new Error('dashboard not found')
    }
    return dashboard
  }

  getWidgets(id: string): WidgetData[] {
    return _.cloneDeep(this.pickDashboard(id).widgets)
  }

  getDashboards(): Omit<Dashboard, 'widgets'>[] {
    return _.cloneDeep(this.dashboards.map(dashboard => ({
      title: dashboard.title,
      id: dashboard.id,
    })))
  }

  getDashboard(dashboardId: string): Omit<Dashboard, 'widgets'> {
    const { title, id } = this.pickDashboard(dashboardId)
    return {
      title,
      id,
    }
  }

  hasDashboard(dashboardId: string): boolean {
    return this.dashboards.find(dashboard => dashboard.id === dashboardId) != null
  }

  getLayouts(dashboardId: string): Layout[] {
    return _.cloneDeep(this.pickDashboard(dashboardId).widgets.map(widget => widget.layout))
  }

  notify() {
    for (const listener of this.listeners.slice()) {
      listener()
    }
  }

  store() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.dashboards))
  }

  removeDashboard(dashboardId: string) {
    this.dashboards = this.dashboards.filter(dashboard => dashboard.id !== dashboardId)
    this.store()
    this.notify()
  }

  removeWidget(dashboardId: string, widgetId: string) {
    const dashboard = this.pickDashboard(dashboardId)
    dashboard.widgets = dashboard.widgets.filter(widget => widget.layout.i !== widgetId)
    this.store()
    this.notify()
  }

  addDashboard({ title }: Pick<Dashboard, 'title'>): string {
    const id = uuidV4()
    this.dashboards.push({
      id,
      title,
      widgets: [],
    })
    this.store()
    this.notify()
    return id;
  }

  addWidget(dashboardId: string, { type, payload, layout }: WidgetData): string {
    const i = uuidV4()
    const dashboard = this.pickDashboard(dashboardId)
    dashboard.widgets.push({
      type,
      payload: _.cloneDeep(payload),
      layout: {
        ...layout,
        i,
      },
    })
    this.store()
    this.notify()
    return i
  }

  updateDashboard(dashboardId: string, layouts: Layout[]) {
    const dashboard = this.pickDashboard(dashboardId)
    const map: Record<string, WidgetData> = Object.fromEntries(
      dashboard.widgets.map(widget => [widget.layout.i, widget])
    )
    dashboard.widgets = layouts.filter(layout => layout.i in map).map(layout => ({
      ...map[layout.i],
      layout,
    }))
    this.store()
    this.notify()
  }

  updateDashboardTitle(dashboardId: string, title: string) {
    const dashboard = this.pickDashboard(dashboardId)
    dashboard.title = title
    this.store()
    this.notify()
  }

  updateWidget(dashboardId: string, widgetId: string, payload: Record<string, any>) {
    const dashboard = this.pickDashboard(dashboardId)
    const widget = dashboard.widgets.find(widget => widget.layout.i === widgetId)
    if (widget == null) {
      throw new Error('widget not found')
    }
    widget.payload = _.cloneDeep(payload)
    this.store()
    this.notify()
  }

  addEventListener(listener: () => void) {
    this.listeners.push(listener)
  }

  removeEventListener(listener: () => void) {
    const index = this.listeners.indexOf(listener)
    if (index > 0) {
      this.listeners.splice(index, 1)
    }
  }
}
