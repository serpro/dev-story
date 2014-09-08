pandaConfig = {
    sourceFolder: 'src',
    outputFile: 'game.min.js',
    ignoreModules: [
        'engine.keyboard'
    ],
    system: {
        orientation: 'landscape',
        width: "window",
        height: "window",
        bgColor: 0x0074bb,
        webGL:true,
        antialias: false,
        transparent: false,
        pauseOnHide: false,
        scaleToFit: true
    },
    loader: {
        timeout:0,
        bgColor: 0x143559,
        barColor: 0x143559,
        barBg: 0x143559,
        barHeight: 0,
        barMargin: 0,
        barWidth: 0
    },
    debug: {
        enabled: false,
        color: 'cyan',
        frequency: 1000,
        position: { x: 5, y: 50 }
    },
    storage: {
        id: 'xdk.memory'
    }
};