'use strict';

const React = require('react');
const ReactNative = require('react-native');
const {
    View,
    Text,
    StyleSheet,
    ListView,
} = ReactNative;

const TimerMixin = require('react-timer-mixin');
const RefreshInfiniteListView = require('@remobile/react-native-refresh-infinite-listview');

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
module.exports = React.createClass({
    mixins: [TimerMixin],
    data: { index: 0, maxIndex:20, list:[] },
    getData (init) {
        let total = 5;
        if (init) {
            this.data.index = 0;
            this.data.list = [];
            total = Math.floor(Math.random() * 5);
        }
        for (let i = 0; i < total; i++) {
            this.data.list[this.data.index] = 'Row' + (this.data.index + 1);
            this.data.index++;
        }
    },
    getInitialState () {
        this.getData(true);
        return {
            dataSource: ds.cloneWithRows(this.data.list),
        };
    },
    onRefresh () {
        this.getData(true);
        this.setTimeout(() => {
            this.list.hideHeader();
            this.setState({ dataSource: ds.cloneWithRows(this.data.list) });
        }, 1000);
    },
    onInfinite () {
        this.getData();
        this.setTimeout(() => {
            this.list.hideFooter();
            this.setState({ dataSource: ds.cloneWithRows(this.data.list) });
        }, 1000);
    },
    loadedAllData () {
        return this.data.index >= this.data.maxIndex || this.data.index === 0;
    },
    renderRow (text) {
        return (
            <View style={styles.row}>
                <Text >
                    {text}
                </Text>
            </View>
        );
    },
    renderSeparator (sectionID, rowID) {
        return (
            <View style={styles.separator} key={sectionID + rowID} />
        );
    },
    render () {
        return (
            <View style={{ flex:1 }}>
                <View style={{ height:20 }} />
                <RefreshInfiniteListView
                    ref={(list) => { this.list = list; }}
                    dataSource={this.state.dataSource}
                    renderRow={this.renderRow}
                    renderSeparator={this.renderSeparator}
                    loadedAllData={this.loadedAllData}
                    initialListSize={30}
                    scrollEventThrottle={10}
                    style={{ backgroundColor:'transparent' }}
                    onRefresh={this.onRefresh}
                    onInfinite={this.onInfinite}
                     />
            </View>
        );
    },
});

const styles = StyleSheet.create({
    row: {
        height:60,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        alignSelf:'stretch',
    },
    separator: {
        height: 1,
        backgroundColor: '#CCC',
    },
});
