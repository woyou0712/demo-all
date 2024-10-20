df = pd.DataFrame(ka.kline)
if ma_params is not None:
    df = ma(df, params=ma_params)
df = macd(df)
x =  df.dt.to_list()
title = "%s -%s  | %s 至 %s " % (ka.symbol, ka.freq_enum.minutes, ka.start_dt, ka.end_dt)

last_zs_info = '无中枢' if len(ka.xdzs)==0 else zs_print(ka.xdzs[-1])
subtitle="最后一个中枢: \n %s \n\n 背驰状态\n %s--%s" % (last_zs_info,ka.current_bi_state,ka.beichi_state)
kline = (
    Kline()
        .add_xaxis(xaxis_data=x)
        .add_yaxis(
        series_name="",
        y_axis=df[['open', 'close', 'low', 'high']].values.tolist(),
        itemstyle_opts=opts.ItemStyleOpts(
            color=down_color,
            color0=rise_color,
            border_color=down_color,
            border_color0=rise_color,
        ),
        tooltip_opts=opts.TooltipOpts(is_show=False),
    )
        .set_series_opts(
        markarea_opts=opts.MarkAreaOpts(is_silent=True)
    )
        .set_global_opts(
        title_opts=opts.TitleOpts(title=title,
                                  # pos_right="0",
                                  subtitle=subtitle,subtitle_textstyle_opts=TextStyleOpts(color="red"),
                                  # padding=50,
                                  ),
        xaxis_opts=opts.AxisOpts(
            type_="category",
            is_scale=False,
            boundary_gap=False,
            axisline_opts=opts.AxisLineOpts(is_on_zero=False),
            splitline_opts=opts.SplitLineOpts(is_show=False),
            split_number=20,
            min_="dataMin",
            max_="dataMax",
        ),
        yaxis_opts=opts.AxisOpts(
            is_scale=True, splitline_opts=opts.SplitLineOpts(is_show=True),
            axislabel_opts=opts.LabelOpts(is_show=True, position="inside")
        ),
        # tooltip_opts=opts.TooltipOpts(trigger="axis", axis_pointer_type="line",is_show=True),
        datazoom_opts=[
            opts.DataZoomOpts(
                is_show=False, type_="inside", xaxis_index=[0, 0], range_end=100
            ),
            opts.DataZoomOpts(
                is_show=True, xaxis_index=[0, 1], pos_top="96%", range_end=100
            ),
            opts.DataZoomOpts(is_show=False, xaxis_index=[0, 2], range_end=100),
        ],
        # 三个图的 axis 连在一块
        axispointer_opts=opts.AxisPointerOpts(
            is_show=True,
            link=[{"xAxisIndex": "all"}],
            label=opts.LabelOpts(background_color="#777"),
        ),
    )
)

kline_line = (
    Line()
        .add_xaxis(xaxis_data=x)
        .add_yaxis(
        series_name="笔",
        y_axis=df.bi.tolist(),
        is_smooth=False,
        is_connect_nones=True,
        symbol='diamond',
        symbol_size=8,
        linestyle_opts=opts.LineStyleOpts(opacity=1, type_='dotted', width=2,color='blue'),
        label_opts=opts.LabelOpts(is_show=False),
        tooltip_opts=opts.TooltipOpts(is_show=False),
    )
        .add_yaxis(
        series_name="线段",
        y_axis=df.xd.tolist(),
        is_smooth=False,
        is_connect_nones=True,
        symbol='triangle',
        symbol_size=12,
        linestyle_opts=opts.LineStyleOpts(opacity=1, type_='solid', width=2,color='red'),
        label_opts=opts.LabelOpts(is_show=True, position='right'),
        tooltip_opts=opts.TooltipOpts(is_show=False),
    )
        .set_global_opts(
        xaxis_opts=opts.AxisOpts(
            type_="category",
            grid_index=1,
            axislabel_opts=opts.LabelOpts(is_show=False),
        ),
        yaxis_opts=opts.AxisOpts(
            grid_index=1,
            split_number=3,
            axisline_opts=opts.AxisLineOpts(is_on_zero=False),
            axistick_opts=opts.AxisTickOpts(is_show=False),
            splitline_opts=opts.SplitLineOpts(is_show=False),
            axislabel_opts=opts.LabelOpts(is_show=True, position="inside"),
        ),
    )
)

if ma_params is not None:
    for ma_p in ma_params:
        kline_line.add_yaxis(
            series_name="MA"+ str(ma_p),
            y_axis=df["ma"+str(ma_p)].tolist(),
            is_smooth=False,
            is_connect_nones=True,
            symbol_size=0,
            linestyle_opts=opts.LineStyleOpts(opacity=1, type_='solid', width=1),
            label_opts=opts.LabelOpts(is_show=False, position='right'),
            tooltip_opts=opts.TooltipOpts(is_show=False),
        )
# Overlap Kline + Line
overlap_kline_line = kline.overlap(kline_line)

if len(ka.xdzs) > 0:
    i = 0
    for zsi in ka.xdzs[-6:]:
        i= i+1

        from_x  = zsi['points'][0]['dt']
        end_x = zsi['points'][len(zsi['points'])-1]['dt']
        from_y = zsi['ZD']
        end_y = zsi['ZG']

        from_t = datetime.strptime(from_x,"%Y-%m-%d %H:%M:%S")
        end_t = datetime.strptime(end_x,"%Y-%m-%d %H:%M:%S")

        cur_t = from_t
        xpoints = []
        xpoints_y = []
        while cur_t <= end_t:
            xpoints.append(datetime.strftime(cur_t,"%Y-%m-%d %H:%M:%S"))
            xpoints_y.append(from_y)
            xpoints_y.append(end_y)
            cur_t = cur_t + timedelta(seconds=ka.freq_enum.minutes * 60)

        cur_y = from_y
        ypoints = []
        ypoints.append(cur_y)

        each= (end_y-from_y)/4

        while cur_y <= end_y:
            ypoints.append(cur_y)
            cur_y = cur_y + each



        zhongshu = (Scatter().add_xaxis(xpoints)
                   .add_yaxis('中枢'+str(i),xpoints_y ,
                              color='black',
                              label_opts=opts.LabelOpts(is_show=False),
                              symbol_size=[10,10],
                              tooltip_opts=opts.TooltipOpts(
                                  is_show=True,
                                  position="left",
                                  # trigger="axis",
                                  formatter=JsCode(
                                          """
                                      function(params) {
                                          var colorList;
                                          if (barData[params.dataIndex][1] > barData[params.dataIndex][0]) {
                                              colorList = '#14b143';
                                          } else {
                                              colorList = '#ef232a';
                                          }
                                          return '123';
                                      }
                                      """
                                  )
                              ),
                              )
                   )

        overlap_kline_line = overlap_kline_line.overlap(zhongshu)

        print('识别中枢'+str(ka.freq_enum.minutes)+'级别:'+ zs_print(zsi))


if isinstance(bs, pd.DataFrame) and len(bs) > 0:
    c = (
        Scatter()
            .add_xaxis(bs['时间'].to_list())
            .add_yaxis(
            "买卖点",
            bs['价格'].to_list(),
            label_opts=opts.LabelOpts(
                is_show=True,
                position="left",
                formatter=JsCode(
                    "function(params){return bsName[params.dataIndex][0];}"
                )
            ),
        ))
    overlap_kline_line = overlap_kline_line.overlap(c)



# draw volume
bar_volume = (
    Bar()
        .add_xaxis(xaxis_data=x)
        .add_yaxis(
        series_name="Volume",
        # yaxis_data=df.vol.tolist(),
        y_axis=df.vol.tolist(),
        xaxis_index=1,
        yaxis_index=1,
        label_opts=opts.LabelOpts(is_show=False),
        tooltip_opts=opts.TooltipOpts(is_show=False),
        itemstyle_opts=opts.ItemStyleOpts(
            color=JsCode(
                """
            function(params) {
                var colorList;
                if (barData[params.dataIndex][1] > barData[params.dataIndex][0]) {
                    colorList = '#14b143';
                } else {
                    colorList = '#ef232a';
                }
                return colorList;
            }
            """
            )
        ),
    )
        .set_global_opts(
        xaxis_opts=opts.AxisOpts(
            type_="category",
            grid_index=1,
            axislabel_opts=opts.LabelOpts(is_show=False),
        ),
        yaxis_opts=opts.AxisOpts(
            axislabel_opts=opts.LabelOpts(is_show=True, position='inside')
        ),
        legend_opts=opts.LegendOpts(is_show=False),
    )
)

# Bar-2 (Overlap Bar + Line)
bar_macd = (
    Bar()
        .add_xaxis(xaxis_data=x)
        .add_yaxis(
        series_name="MACD",
        # yaxis_data=df.macd.tolist(),
        y_axis=df.macd.tolist(),
        xaxis_index=2,
        yaxis_index=2,
        label_opts=opts.LabelOpts(is_show=False),
        tooltip_opts=opts.TooltipOpts(is_show=False),
        itemstyle_opts=opts.ItemStyleOpts(
            color=JsCode(
                """
                    function(params) {
                        var colorList;
                        if (params.data >= 0) {
                          colorList = '#14b143';
                        } else {
                          colorList = '#ef232a';
                        }
                        return colorList;
                    }
                    """
            )
        ),
    )
        .set_global_opts(
        xaxis_opts=opts.AxisOpts(
            type_="category",
            grid_index=2,
            axislabel_opts=opts.LabelOpts(is_show=False),
        ),
        yaxis_opts=opts.AxisOpts(
            grid_index=2,
            split_number=4,
            axisline_opts=opts.AxisLineOpts(is_on_zero=False),
            axistick_opts=opts.AxisTickOpts(is_show=False),
            splitline_opts=opts.SplitLineOpts(is_show=False),
            axislabel_opts=opts.LabelOpts(is_show=True, position="inside"),
        ),
        legend_opts=opts.LegendOpts(is_show=False),
    )
)

line_macd_diff = (
    Line()
        .add_xaxis(xaxis_data=x)
        .add_yaxis(
        series_name="DIF",
        y_axis=df['diff'].tolist(),
        xaxis_index=2,
        yaxis_index=2,
        label_opts=opts.LabelOpts(is_show=False),
        tooltip_opts=opts.TooltipOpts(is_show=False),
    )
        .add_yaxis(
        series_name="DEA",
        y_axis=df['dea'].tolist(),
        xaxis_index=2,
        yaxis_index=2,
        label_opts=opts.LabelOpts(is_show=False),
        tooltip_opts=opts.TooltipOpts(is_show=False),
    )
        .set_global_opts(legend_opts=opts.LegendOpts(is_show=False))
)

# draw MACD
bar_macd_with_diff = bar_macd.overlap(line_macd_diff)

# 最后的 Grid
grid_chart = Grid(init_opts=opts.InitOpts(width=width, height=height, page_title=title))
grid_chart.add_js_funcs("var barData = {}".format(df[['open', 'close', 'low', 'high']].values.tolist()))
if isinstance(bs, pd.DataFrame) and len(bs) > 0:
    grid_chart.add_js_funcs("var bsName = {}".format(bs[["操作提示", "价格","时间"]].values.tolist()))

grid_chart.add(
    overlap_kline_line,
    grid_opts=opts.GridOpts(pos_left="3%", pos_right="20%", height="60%",background_color="black"),
)
grid_chart.add(
    bar_volume,
    grid_opts=opts.GridOpts(pos_left="3%", pos_right="20%", pos_top="71%", height="10%",background_color="black"),
)
grid_chart.add(
    bar_macd_with_diff,
    grid_opts=opts.GridOpts(pos_left="3%", pos_right="20%", pos_top="82%", height="14%",background_color="black"),
)

grid_chart.render(path=file_html)