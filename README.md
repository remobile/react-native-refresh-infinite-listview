# React Native RefreshableListView
A awesome pull-down-refresh and pull-up-loadmore listview

## Installation
```sh
npm install react-native-refresh-infinite-listview --save
```

## Usage

### Example
```js
'use strict';

var React = require('react-native');
var {
    View,
    Text,
    StyleSheet,
    ListView
} = React;

var TimerMixin = require('react-timer-mixin');
var RefreshInfiniteListView = require('react-native-refresh-infinite-listview');

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}) // assumes immutable objects
module.exports = React.createClass({
    mixins: [TimerMixin],
    data: {index: 0, list:[]},
    getData(init) {
        var total = 5;
        if (init) {
        this.data.index = 0;
        this.data.list = [];
        total = Math.floor(Math.random()*5);
    }
        for (var i=0; i<total; i++) {
            this.data.list[this.data.index] = "Row" + this.data.index;
            this.data.index++;
        }
    },
    getInitialState() {
        this.getData(true);
        return {
            isLoadedAllData: false,
            dataSource: ds.cloneWithRows(this.data.list)
        }
    },
    onRefresh() {
        this.getData(true);
        this.setTimeout(()=>{
            this.list.hideHeader();
            this.setState({dataSource: ds.cloneWithRows(this.data.list)});
        }, 1000);
    },
    onInfinite() {
        this.getData();
        this.setTimeout(()=>{
            this.list.hideFooter();
            this.setState({dataSource: ds.cloneWithRows(this.data.list)});
        }, 1000);
    },
    renderRow(text) {
        return (
            <View style={{height:40, justifyContent:'center', alignItems:'center'}}>
                <Text>
                    {text}
                </Text>
            </View>
        )
    },
    render() {
        return (
            <View style={{flex:1}}>
                <View style={{height:20}} />
                <RefreshInfiniteListView
                    ref = {(list) => {this.list= list}}
                    dataSource={this.state.dataSource}
                    renderRow={this.renderRow}
                    initialListSize={30}
                    scrollEventThrottle={10}
                    style={{backgroundColor:'transparent'/*,top:100, left:10, width:200, height:300, position:'absolute'*/}}
                    onRefresh = {this.onRefresh}
                    onInfinite = {this.onInfinite}
                    >
                </RefreshInfiniteListView>
            </View>
        )
    }
});

```

## Screencasts

![refresh](https://github.com/remobile/react-native-refresh-infinite-listview/master/screencasts/refresh.gif)

#### Props
- `footerHeight:number`
    if you need use infinite with custom, must set footerHeight
- `pullDistance:number`
    set pull distance, default is 50
- `renderEmptyRow:func`
    default:
```js
            renderEmptyRow: () => {
                return (
                    <View style={{height:Dimensions.get('window').height, justifyContent:'center',alignItems:'center'}}>
                        <Text style={{fontSize:40, fontWeight:'800', color:'red'}}>
                            have no data
                        </Text>
                    </View>
                )
            },
```
- `renderHeaderRefreshIdle:func`
    default:
```js
            renderHeaderRefreshIdle: () => {return (
                <View style={{flex:1, height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center'}}>
                    <Text style={styles.text}>
                        pull down refresh...
                    </Text>
                    <Image
                        source={require('./pull_arrow.png')}
                        resizeMode={Image.resizeMode.stretch}
                        style={styles.image}
                        />
                </View>
            )},
```
- `renderHeaderWillRefresh:func`
    default:
```js
            renderHeaderWillRefresh: () => {return (
                <View style={{height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center'}}>
                    <Text style={styles.text}>
                        release to refresh...
                    </Text>
                    <Image
                        source={require('./pull_arrow.png')}
                        resizeMode={Image.resizeMode.stretch}
                        style={[styles.image, styles.imageRotate]}
                        />
                </View>
            )},
```
- `renderHeaderRefreshing:func`
    default:
```js
            renderHeaderRefreshing: () => {return (
                <View style={{height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center'}}>
                    <Text style={styles.text}>
                        refreshing...
                    </Text>

                    <ActivityIndicatorIOS
                        size='small'
                        animating={true}/>
                </View>
            )},
```
- `renderHeaderRefreshing:func`
    default:
```js
            renderFooterInifiteIdle: () => {return (
                <View style={{height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center'}}>
                    <Image
                        source={require('./pull_arrow.png')}
                        resizeMode={Image.resizeMode.stretch}
                        style={[styles.image, styles.imageRotate]}
                        />
                    <Text style={styles.text}>
                        pull up to load more...
                    </Text>
                </View>
            )},
```
- `renderFooterWillInifite:func`
    default:
```js
            renderFooterWillInifite: () => {return (
                <View style={{height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center'}}>
                    <Image
                        source={require('./pull_arrow.png')}
                        resizeMode={Image.resizeMode.stretch}
                        style={styles.image}
                        />
                    <Text style={styles.text}>
                        release to load more...
                    </Text>
                </View>
            )},
```
- `renderFooterInifiting:func`
    default:
```js
            renderFooterInifiting: () => {return (
                <View style={{height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center'}}>
                    <ActivityIndicatorIOS
                        size='small'
                        animating={true}/>
                    <Text style={styles.text}>
                        loading...
                    </Text>
                </View>
            )},
```
- `onRefresh:func`
    default:
```js
            onRefresh: () => {
                console.log("onRefresh");
            },
```
- `onInfinite':func`
    default:
```js
            onInfinite: () => {
                console.log("onInfinite");
            }
```
