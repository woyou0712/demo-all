import { nextTick, ref, watch } from "vue";
import * as Echarts from "echarts";

export default function useChart(id, props, emits) {
  const elements = [];
  const chartOptions = () => {
    const oname = "开盘价";
    const cname = "收盘价";
    const lname = "最低价";
    const hname = "最高价";
    const options = {
      xAxis: {
        type: "category",
        data: [],
        axisLabel: {
          color: "#fff",
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          animation: false,
          type: "cross",
          lineStyle: {
            color: "#376df4",
            width: 2,
            opacity: 1,
          },
        },
        formatter(params) {
          // params 是一个包含所有 series 数据信息的对象数组
          var result = `<div>${params[0].axisValue}</div>`; // 时间戳
          result += `<table class="line-chart-k-body">`;
          result += `<tr class="line-chart-k-message"><td class="title">${oname}</td> <td class="number">&nbsp;${params[0].value[1]}</td></tr>`;
          result += `<tr class="line-chart-k-message"><td class="title">${cname}</td> <td class="number">&nbsp;${params[0].value[2]}</td></tr>`;
          const l = Math.min(params[0].value[3], params[0].value[4]);
          const h = Math.max(params[0].value[3], params[0].value[4]);
          result += `<tr class="line-chart-k-message"><td class="title">${lname}</td> <td class="number">&nbsp;${l}</td></tr>`;
          result += `<tr class="line-chart-k-message"><td class="title">${hname}</td> <td class="number">&nbsp;${h}</td></tr>`;
          result += "</table>";
          return result;
        },
      },
      yAxis: {
        type: "value",
        min: "dataMin",
        axisLabel: {
          color: "#fff",
        },
      },
      graphic: {
        elements, // 用于存放我们动态添加的图形
      },
      series: [
        {
          type: "candlestick",
          data: [],
        },
      ],
    };
    props.data.list.forEach((item) => {
      options.xAxis.data.push(item.time);
      options.series[0].data.push([item.o, item.c, item.l, item.h]);
    });
    return options;
  };

  let myChart = null;
  let option = null;

  /**
   * 渲染K线图
   */
  const rendLineChartK = () => {
    if (!myChart) {
      const el = document.getElementById(id);
      myChart = Echarts.init(el);
    }
    option = chartOptions();
    myChart.setOption(option);
    initChart();
    // 监听鼠标按下事件
    myChart.getZr().on("mousedown", function (params) {
      if (params.event.button === 0) {
        // 左键按下
        newRect = {
          startX: params.offsetX,
          startY: params.offsetY,
        };
      }
    });

    // 监听鼠标移动事件
    myChart.getZr().on("mousemove", function (params) {
      if (newRect) {
        // 如果有新的矩形正在绘制
        newRect.endX = params.offsetX;
        newRect.endY = params.offsetY;
        updateRect();
      }
    });

    // 监听鼠标抬起事件
    myChart.getZr().on("mouseup", function () {
      if (newRect && newRect.endX && newRect.endY) {
        // 重置绘制状态
        getRectData(newRect); // 获取矩形数据
      }
      newRect = null;
    });
  };

  let newRect = null;

  function updateRect() {
    if (!newRect) return;
    const { startX, startY, endX, endY } = newRect;
    // 如果已经有矩形存在，则更新它的位置和大小
    if (newRect.rectElement) {
      newRect.rectElement.shape = {
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width: Math.abs(endX - startX),
        height: Math.abs(endY - startY),
      };
    } else {
      // 否则，创建一个新的矩形
      newRect.rectElement = {
        type: "rect",
        shape: {
          x: Math.min(startX, endX),
          y: Math.min(startY, endY),
          width: Math.abs(endX - startX),
          height: Math.abs(endY - startY),
          zlevel: 1000 + elements.length, // 提高矩形的层级
          z: 100,
        },
        style: {
          fill: "rgba(0, 0, 255, 0.3)", // 蓝色填充
          // stroke: "blue", // 蓝色边框
        },
      };
      elements.push(newRect.rectElement);
    }
    myChart.setOption(option); // 更新图表配置
  }

  const initChart = () => {
    if (!myChart) return;
    setTimeout(() => {
      const data = props.data.rects;
      data.forEach((item) => {
        const xIndexS = props.data.list.findIndex(
          (i) => i.time === item.startX
        );
        // 根据索引获取X轴坐标，根据值获取Y轴坐标
        const [startX, startY] = myChart.convertToPixel({ seriesIndex: 0 }, [
          xIndexS,
          item.startY,
        ]);
        const xIndexE = props.data.list.findIndex((i) => i.time === item.endX);
        const [endX, endY] = myChart.convertToPixel({ seriesIndex: 0 }, [
          xIndexE,
          item.endY,
        ]);
        newRect = {
          startX,
          startY,
          endX,
          endY,
        };
        updateRect(); // 更新矩形
      });
      newRect = null;
    }, 100);
  };

  const selectedData = ref([]); // 选中数据
  /**
   * 清空矩形
   */
  function clearRect() {
    // 移除矩形
    elements.forEach((item) => {
      item.shape = { x: 0, y: 0, width: 0, height: 0 };
    });
    myChart.setOption(option); // 更新图表配置
    elements.splice(0);
    selectedData.value.splice(0);
    emits("rect-select", selectedData.value);
  }

  // 获取矩形范围内的数据
  const getRectData = (rectInfo) => {
    const { startX, startY, endX, endY } = rectInfo;

    // 获取所选区域内的数据
    const data = props.data.list.filter((item) => {
      const index = myChart.getOption().xAxis[0].data.indexOf(item.time);
      const rect = myChart.convertToPixel({ seriesIndex: 0 }, [index, item.o]);
      const [x, y] = rect;
      return (
        x >= Math.min(startX, endX) &&
        x <= Math.max(startX, endX) &&
        y >= Math.min(startY, endY) &&
        y <= Math.max(startY, endY)
      );
    });
    selectedData.value.push(...data);
    emits("rect-select", selectedData.value);
  };
  let t = null;
  watch([() => props.data.list, () => props.data.rects], () => {
    t && clearTimeout(t);
    t = setTimeout(rendLineChartK, 100);
  });

  return { rendLineChartK, clearRect };
}
