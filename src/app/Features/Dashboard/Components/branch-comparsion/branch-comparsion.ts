import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../Services/dashboard.service';
import { BranchData, DateRange } from '../../Models/dashboard.model';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-comparsion.html',
  styleUrls: ['./branch-comparsion.css']
})
export class BarChartComponent implements OnInit, AfterViewInit, OnDestroy {
  title: string = 'Branch Performance Comparison';

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  // Data Properties
  branchData: BranchData[] = [];
  isLoading: boolean = false;
  private subscriptions: Subscription[] = [];
  visibleBranchCount: number = 5;
hoveredBarInfo: { x: number; y: number; branch: BranchData; visible: boolean } | null = null;
private tooltipElement: HTMLDivElement | null = null;
  // Date Filter Properties
  showFilterPanel: boolean = false;
  dateRange: DateRange = {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  };

  tempDateRange: DateRange = {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  };

  // Responsive Properties
  isMobile: boolean = false;
  isTablet: boolean = false;
  chartWidth: number = 900;
  chartHeight: number = 450;
  canvasWidth: number = 900;

  // Summary Statistics
  summary = {
    totalRevenue: 0,
    totalSales: 0,
    totalOrders: 0,
    averageRevenue: 0,
    topBranch: null as BranchData | null
  };

  private animationFrameId: any;
  private targetRevenueValues: number[] = [];
  private targetSalesValues: number[] = [];
  private targetOrdersValues: number[] = [];
  private currentRevenueValues: number[] = [];
  private currentSalesValues: number[] = [];
  private currentOrdersValues: number[] = [];

  maxRevenueValue: number = 0;
  maxSalesValue: number = 0;
  maxOrdersValue: number = 0;

  private resizeObserver: ResizeObserver | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadBranchData();
    this.checkScreenSize();
  }

ngAfterViewInit() {
  setTimeout(() => {
    if (this.branchData.length > 0) {
      this.drawChart();
    }
  }, 100);

  this.createTooltip();

  if (this.chartCanvas) {
    const canvas = this.chartCanvas.nativeElement;

    canvas.addEventListener('mousemove', (event: MouseEvent) => {
      this.handleCanvasHover(event);
    });

    canvas.addEventListener('mouseleave', () => {
      this.hideTooltip();
    });
  }

  if (this.chartCanvas && this.chartCanvas.nativeElement) {
    this.resizeObserver = new ResizeObserver(() => {
      this.checkScreenSize();
      this.drawChart();
    });
    this.resizeObserver.observe(this.chartCanvas.nativeElement.parentElement!);
  }
}

createTooltip() {
  this.tooltipElement = document.createElement('div');
  this.tooltipElement.style.cssText = `
    position: fixed;
    background: rgba(15, 23, 42, 0.92);
    color: white;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 12px;
    font-family: Inter, system-ui, sans-serif;
    pointer-events: none;
    display: none;
    z-index: 9999;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    min-width: 160px;
    border: 1px solid rgba(255,255,255,0.1);
    backdrop-filter: blur(8px);
    transition: opacity 0.15s ease;
  `;
  document.body.appendChild(this.tooltipElement);
}

handleCanvasHover(event: MouseEvent) {
  if (!this.chartCanvas || this.branchData.length === 0) return;

  const canvas = this.chartCanvas.nativeElement;
  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / (parseFloat(canvas.style.width) || canvas.width);
  const mouseX = (event.clientX - rect.left) * scaleX / (window.devicePixelRatio || 1);
  const mouseY = (event.clientY - rect.top) * scaleX / (window.devicePixelRatio || 1);

  const width = this.canvasWidth;
  const height = this.chartHeight;
  const padding = this.getResponsivePadding(width);
  const chartHeight = height - padding.top - padding.bottom;

  const barGroupWidth = (width - padding.left - padding.right) / this.branchData.length * 0.85;
  const barSpacing = (width - padding.left - padding.right) / this.branchData.length;
  const singleBarWidth = barGroupWidth / 3;
  const barGap = 2;
  const adjustedBarWidth = singleBarWidth - barGap;

  const maxValue = Math.max(this.maxRevenueValue, this.maxSalesValue, this.maxOrdersValue);

  let foundBar = false;

  for (let i = 0; i < this.branchData.length; i++) {
    const groupX = padding.left + (i * barSpacing) + (barSpacing - barGroupWidth) / 2;

    const bars = [
      {
        x: groupX,
        value: this.currentRevenueValues[i],
        label: 'Revenue',
        color: '#10b981',
        format: (v: number) => v >= 1000000 ? `${(v/1000000).toFixed(2)}M EGP` : `${(v/1000).toFixed(1)}K EGP`
      },
      {
        x: groupX + adjustedBarWidth,
        value: this.currentSalesValues[i],
        label: 'Online Orders',
        color: '#f59e0b',
        format: (v: number) => v >= 1000000 ? `${(v/1000000).toFixed(2)}M EGP` : `${(v/1000).toFixed(1)}K EGP`
      },
      {
        x: groupX + adjustedBarWidth * 2,
        value: this.currentOrdersValues[i],
        label: 'Orders',
        color: '#8b5cf6',
        format: (v: number) => v.toLocaleString()
      }
    ];

    for (const bar of bars) {
      const barHeight = (bar.value / maxValue) * chartHeight;
      const barTop = padding.top + chartHeight - barHeight;
      const barBottom = padding.top + chartHeight;

      if (
        mouseX >= bar.x &&
        mouseX <= bar.x + adjustedBarWidth &&
        mouseY >= barTop &&
        mouseY <= barBottom
      ) {
        this.showTooltip(event, this.branchData[i], bar);
        foundBar = true;
        break;
      }
    }
    if (foundBar) break;
  }

  if (!foundBar) {
    this.hideTooltip();
  }
}

showTooltip(event: MouseEvent, branch: BranchData, bar: any) {
  if (!this.tooltipElement) return;

  this.tooltipElement.innerHTML = `
    <div style="font-weight:700; margin-bottom:6px; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:5px;">
      🏢 ${branch.name}
    </div>
    <div style="display:flex; align-items:center; gap:8px;">
      <span style="width:10px;height:10px;border-radius:3px;background:${bar.color};display:inline-block;flex-shrink:0;"></span>
      <span style="color:#94a3b8;">${bar.label}:</span>
      <span style="font-weight:600; margin-left:auto;">${bar.format(bar.value)}</span>
    </div>
  `;

  const tooltipWidth = 190;
  let left = event.clientX + 14;
  let top = event.clientY - 20;

  if (left + tooltipWidth > window.innerWidth) {
    left = event.clientX - tooltipWidth - 14;
  }

  this.tooltipElement.style.left = `${left}px`;
  this.tooltipElement.style.top = `${top}px`;
  this.tooltipElement.style.display = 'block';
}

hideTooltip() {
  if (this.tooltipElement) {
    this.tooltipElement.style.display = 'none';
  }
}



  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
    this.drawChart();
  }

checkScreenSize() {
  const width = window.innerWidth;
  this.isMobile = width < 768;
  this.isTablet = width >= 768 && width < 1024;

  if (this.isMobile) {
    this.chartHeight = 400;
    this.visibleBranchCount = 3;
    const minWidth = Math.max(this.branchData.length * 220, width - 40);
    this.canvasWidth = this.branchData.length > 3 ? minWidth : width - 40;
  } else if (this.isTablet) {
    this.chartHeight = 400;
    this.visibleBranchCount = 3;
    const containerWidth = this.chartCanvas?.nativeElement?.parentElement?.offsetWidth || 800;
    this.canvasWidth = this.branchData.length > 3
      ? Math.max(this.branchData.length * 200, containerWidth)
      : containerWidth;
  } else {
    this.chartHeight = 450;
    this.visibleBranchCount = 5;
    const containerWidth = this.chartCanvas?.nativeElement?.parentElement?.offsetWidth || 1000;
    this.canvasWidth = this.branchData.length > 5
      ? Math.max(this.branchData.length * 180, containerWidth)
      : containerWidth;
  }
}

loadBranchData() {
  this.isLoading = true;

  this.subscriptions.push(
    this.dashboardService.getStores().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          // Map API response to chart-friendly format
          this.branchData = response.data.map((store, index) => ({
            name: store.branchName,
            revenue: store.revenue,
            sales: store.onlineOrders,   // repurposed field
            orders: store.totalOrders,
            pickupOrders: store.pickupOrders,
            percentageOfRevenue: store.percentageOfRevenue,
            color: this.getBranchColor(index)
          }));
        }
        this.isLoading = false;
        this.updateChartData();
        this.calculateSummary();
        this.checkScreenSize();
        setTimeout(() => this.drawChart(), 100);
      },
      error: (err) => {
        console.error('Failed to load store data', err);
        this.isLoading = false;
      }
    })
  );
}

private getBranchColor(index: number): string {
  const colors = [
    '#ef4444','#3b82f6','#10b981','#f59e0b',
    '#8b5cf6','#ec4899','#06b6d4','#6366f1',
    '#14b8a6','#f97316','#84cc16','#a855f7','#64748b'
  ];
  return colors[index % colors.length];
}


updateChartData() {
  if (this.branchData.length === 0) return;

  this.targetRevenueValues = this.branchData.map(branch => branch.revenue);
  this.targetSalesValues = this.branchData.map(branch => branch.sales);
  this.targetOrdersValues = this.branchData.map(branch => branch.orders);

  this.maxRevenueValue = Math.max(...this.targetRevenueValues, 0);
  this.maxSalesValue = Math.max(...this.targetSalesValues, 0);
  this.maxOrdersValue = Math.max(...this.targetOrdersValues, 0);


  const globalMax = Math.max(this.maxRevenueValue, this.maxSalesValue, this.maxOrdersValue);
  if (globalMax === 0) {
    this.maxRevenueValue = this.maxSalesValue = this.maxOrdersValue = 1;
  }

  this.currentRevenueValues = [...this.targetRevenueValues];
  this.currentSalesValues = [...this.targetSalesValues];
  this.currentOrdersValues = [...this.targetOrdersValues];
}

  calculateSummary() {
    if (!this.branchData.length) {
      this.summary = {
        totalRevenue: 0,
        totalSales: 0,
        totalOrders: 0,
        averageRevenue: 0,
        topBranch: null
      };
      return;
    }

    const totalRevenue = this.branchData.reduce((sum, b) => sum + b.revenue, 0);
    const totalSales = this.branchData.reduce((sum, b) => sum + b.sales, 0);
    const totalOrders = this.branchData.reduce((sum, b) => sum + b.orders, 0);
    const averageRevenue = totalRevenue / this.branchData.length;
    const topBranch = [...this.branchData].sort((a, b) => b.revenue - a.revenue)[0];

    this.summary = {
      totalRevenue,
      totalSales,
      totalOrders,
      averageRevenue,
      topBranch
    };
  }

  onStartDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const dateValue = input.value;
    if (dateValue) {
      this.tempDateRange.startDate = new Date(dateValue);
    }
  }

  onEndDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const dateValue = input.value;
    if (dateValue) {
      this.tempDateRange.endDate = new Date(dateValue);
    }
  }

  applyDateFilter() {
    this.dateRange = {
      startDate: new Date(this.tempDateRange.startDate),
      endDate: new Date(this.tempDateRange.endDate)
    };
    this.showFilterPanel = false;
    //this.loadBranchData();
  }

  resetDateFilter() {
    this.tempDateRange = {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date()
    };
    this.dateRange = {
      startDate: new Date(this.tempDateRange.startDate),
      endDate: new Date(this.tempDateRange.endDate)
    };
    //this.loadBranchData();
  }

drawChart() {
  if (!this.chartCanvas || this.branchData.length === 0) return;

  const canvas = this.chartCanvas.nativeElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = this.canvasWidth;
  const height = this.chartHeight;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  const padding = this.getResponsivePadding(width);

  this.drawGrid(ctx, width, height, padding);
  this.drawGroupedBars(ctx, width, height, padding);
  this.drawLabels(ctx, width, height, padding);
}

  getResponsivePadding(width: number) {
    if (width < 500) {
      return { top: 60, right: 25, bottom: 90, left: 45 };
    } else if (width < 768) {
      return { top: 55, right: 35, bottom: 85, left: 55 };
    } else {
      return { top: 50, right: 80, bottom: 70, left: 80 };
    }
  }

drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, padding: any) {
  const gridLines = this.isMobile ? 4 : 6;
  const chartHeight = height - padding.top - padding.bottom;

  ctx.save();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;

  const maxValue = Math.max(this.maxRevenueValue, this.maxSalesValue, this.maxOrdersValue, 1);
  const fontSize = this.isMobile ? 9 : 11;
  ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;

  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (chartHeight / gridLines) * i;
    const value = maxValue * (1 - i / gridLines);

    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    let label = '';
    if (maxValue >= 1_000_000) {
      label = `${(value / 1_000_000).toFixed(1)}M`;
    } else if (maxValue >= 1000) {
      label = `${(value / 1000).toFixed(0)}K`;
    } else {
      label = value.toFixed(0);
    }

    ctx.fillStyle = '#64748b';
    ctx.fillText(label, 5, y + 4);
  }

  ctx.restore();
}

  drawGroupedBars(ctx: CanvasRenderingContext2D, width: number, height: number, padding: any) {
  if (this.branchData.length === 0) return;

  const MIN_BAR_HEIGHT = 5; // الحد الأدنى لارتفاع العمود بالبكسل
  const chartHeight = height - padding.top - padding.bottom;
  const barGroupWidth = (width - padding.left - padding.right) / this.branchData.length * 0.85;
  const barSpacing = (width - padding.left - padding.right) / this.branchData.length;
  const singleBarWidth = barGroupWidth / 3;
  const maxValue = Math.max(this.maxRevenueValue, this.maxSalesValue, this.maxOrdersValue, 1);

  const barGap = 2;
  const adjustedBarWidth = singleBarWidth - barGap;
  const labelFontSize = this.isMobile ? 7 : 9;

  for (let i = 0; i < this.branchData.length; i++) {
    const groupX = padding.left + (i * barSpacing) + (barSpacing - barGroupWidth) / 2;

    // ---- Revenue Bar (Green) ----
    let revenueHeight = (this.currentRevenueValues[i] / maxValue) * chartHeight;
    let revenueY = padding.top + chartHeight - revenueHeight;
    if (this.currentRevenueValues[i] > 0 && revenueHeight < MIN_BAR_HEIGHT) {
      revenueHeight = MIN_BAR_HEIGHT;
      revenueY = padding.top + chartHeight - revenueHeight;
    }
    const revenueGradient = ctx.createLinearGradient(groupX, revenueY, groupX, revenueY + revenueHeight);
    revenueGradient.addColorStop(0, '#10b981');
    revenueGradient.addColorStop(1, '#059669');
    ctx.fillStyle = revenueGradient;
    ctx.fillRect(groupX, revenueY, adjustedBarWidth, Math.max(revenueHeight, 0));

    // ---- Sales Bar (Orange) ----
    let salesHeight = (this.currentSalesValues[i] / maxValue) * chartHeight;
    let salesY = padding.top + chartHeight - salesHeight;
    if (this.currentSalesValues[i] > 0 && salesHeight < MIN_BAR_HEIGHT) {
      salesHeight = MIN_BAR_HEIGHT;
      salesY = padding.top + chartHeight - salesHeight;
    }
    const salesGradient = ctx.createLinearGradient(groupX + adjustedBarWidth, salesY, groupX + adjustedBarWidth, salesY + salesHeight);
    salesGradient.addColorStop(0, '#f59e0b');
    salesGradient.addColorStop(1, '#d97706');
    ctx.fillStyle = salesGradient;
    ctx.fillRect(groupX + adjustedBarWidth, salesY, adjustedBarWidth, Math.max(salesHeight, 0));

    // ---- Orders Bar (Purple) ----
    let ordersHeight = (this.currentOrdersValues[i] / maxValue) * chartHeight;
    let ordersY = padding.top + chartHeight - ordersHeight;
    if (this.currentOrdersValues[i] > 0 && ordersHeight < MIN_BAR_HEIGHT) {
      ordersHeight = MIN_BAR_HEIGHT;
      ordersY = padding.top + chartHeight - ordersHeight;
    }
    const ordersGradient = ctx.createLinearGradient(groupX + adjustedBarWidth * 2, ordersY, groupX + adjustedBarWidth * 2, ordersY + ordersHeight);
    ordersGradient.addColorStop(0, '#8b5cf6');
    ordersGradient.addColorStop(1, '#6d28d9');
    ctx.fillStyle = ordersGradient;
    ctx.fillRect(groupX + adjustedBarWidth * 2, ordersY, adjustedBarWidth, Math.max(ordersHeight, 0));

    // ---- Draw labels on/above bars (always visible for positive values) ----
    ctx.font = `bold ${labelFontSize}px Inter, system-ui, sans-serif`;
    ctx.shadowBlur = 0; // clear shadow for text

    // Revenue label
    if (this.currentRevenueValues[i] > 0) {
      let revenueText = '';
      if (this.currentRevenueValues[i] >= 1_000_000) {
        revenueText = `${(this.currentRevenueValues[i] / 1_000_000).toFixed(1)}M`;
      } else if (this.currentRevenueValues[i] >= 1000) {
        revenueText = `${(this.currentRevenueValues[i] / 1000).toFixed(0)}K`;
      } else {
        revenueText = Math.round(this.currentRevenueValues[i]).toString();
      }
      const textWidth = ctx.measureText(revenueText).width;
      const textX = groupX + (adjustedBarWidth - textWidth) / 2;
      let textY = revenueY - 3;
      let useInside = (revenueHeight > 18);
      if (!useInside) {
        textY = revenueY - 5;
        ctx.fillStyle = '#0f172a';
      } else {
        ctx.fillStyle = '#065f46';
      }
      ctx.fillText(revenueText, textX, textY);
    }

    // Sales label
    if (this.currentSalesValues[i] > 0) {
      let salesText = '';
      if (this.currentSalesValues[i] >= 1_000_000) {
        salesText = `${(this.currentSalesValues[i] / 1_000_000).toFixed(1)}M`;
      } else if (this.currentSalesValues[i] >= 1000) {
        salesText = `${(this.currentSalesValues[i] / 1000).toFixed(0)}K`;
      } else {
        salesText = Math.round(this.currentSalesValues[i]).toString();
      }
      const textWidth = ctx.measureText(salesText).width;
      const textX = groupX + adjustedBarWidth + (adjustedBarWidth - textWidth) / 2;
      let textY = salesY - 3;
      let useInside = (salesHeight > 18);
      if (!useInside) {
        textY = salesY - 5;
        ctx.fillStyle = '#0f172a';
      } else {
        ctx.fillStyle = '#92400e';
      }
      ctx.fillText(salesText, textX, textY);
    }

    // Orders label
    if (this.currentOrdersValues[i] > 0) {
      const ordersText = Math.round(this.currentOrdersValues[i]).toLocaleString();
      const textWidth = ctx.measureText(ordersText).width;
      const textX = groupX + adjustedBarWidth * 2 + (adjustedBarWidth - textWidth) / 2;
      let textY = ordersY - 3;
      let useInside = (ordersHeight > 18);
      if (!useInside) {
        textY = ordersY - 5;
        ctx.fillStyle = '#0f172a';
      } else {
        ctx.fillStyle = '#5b21b6';
      }
      ctx.fillText(ordersText, textX, textY);
    }
  }
}

  drawLabels(ctx: CanvasRenderingContext2D, width: number, height: number, padding: any) {
    const barSpacing = (width - padding.left - padding.right) / this.branchData.length;
    const fontSize = this.isMobile ? 8 : 11;

    ctx.save();
    ctx.fillStyle = '#475569';
    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';

    for (let i = 0; i < this.branchData.length; i++) {
      const x = padding.left + (i * barSpacing) + barSpacing / 2;
      const y = height - padding.bottom + 20;
      const label = this.branchData[i].name;

      if (label.length > 12) {
        const wrappedLabel = label.substring(0, 10) + '...';
        ctx.fillStyle = '#475569';
        ctx.fillText(wrappedLabel, x, y);
      } else {
        ctx.fillStyle = '#475569';
        ctx.fillText(label, x, y);
      }
    }

    ctx.restore();
  }

ngOnDestroy() {
  if (this.animationFrameId) {
    cancelAnimationFrame(this.animationFrameId);
  }
  this.subscriptions.forEach(sub => sub.unsubscribe());
  if (this.resizeObserver) {
    this.resizeObserver.disconnect();
  }
  if (this.tooltipElement && this.tooltipElement.parentNode) {
    this.tooltipElement.parentNode.removeChild(this.tooltipElement);
  }
}
}
