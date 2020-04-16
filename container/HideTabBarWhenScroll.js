import React, { PureComponent } from 'react';
import {
  View,
  Animated,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import debounce from 'lodash.debounce';

const NAVBAR_HEIGHT = 100;
const TIMEWAIT = 350;
const TIMEOUT = 350;

export default class Home extends PureComponent {

  constructor(props) {
    super(props);

    const scrollAnim = new Animated.Value(0);
    const offsetAnim = new Animated.Value(0);
    this.state = ({
      scrollAnim,
      offsetAnim,
      clampedScroll: Animated.diffClamp(
        Animated.add(
          scrollAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolateLeft: 'clamp',
          }),
          offsetAnim,
        ),
        0,
        NAVBAR_HEIGHT,
      ),
    });
    this.focusListener;
    this.autocompleteDebounced = debounce(() => this.onMomentumScrollEnd(), TIMEWAIT);
    this._clampedScrollValue = 0;
    this._offsetValue = 0;
    this._scrollValue = 0;
  }

  onMomentumScrollEnd = () => {
    const toValue = this._scrollValue > NAVBAR_HEIGHT &&
      this._clampedScrollValue > (NAVBAR_HEIGHT) / 2
      ? this._offsetValue + NAVBAR_HEIGHT
      : this._offsetValue - NAVBAR_HEIGHT;

    Animated.timing(this.state.offsetAnim, {
      toValue,
      duration: TIMEOUT,
      useNativeDriver: true,
    }).start();
  };

  componentDidMount() {
    this.state.scrollAnim.addListener(({ value }) => {
      const diff = value - this._scrollValue;
      this._scrollValue = value;
      this._clampedScrollValue = Math.min(
        Math.max(this._clampedScrollValue + diff, 0),
        NAVBAR_HEIGHT,
      );
    });
    this.state.offsetAnim.addListener(({ value }) => {
      this._offsetValue = value;
    });
  }

  componentWillUnmount() {
    this.state.scrollAnim.removeAllListeners();
    this.state.offsetAnim.removeAllListeners();
  }

  renderItem = (item, key) => {
    return (<View key={key} height={100} margin={10} backgroundColor={'#ccf2ff'} borderRadius={5} />);
  }

  renderTabbar = () => {
    const { clampedScroll } = this.state;

    const navbarTranslate = clampedScroll.interpolate({
      inputRange: [0, NAVBAR_HEIGHT],
      outputRange: [0, (NAVBAR_HEIGHT)],
      extrapolate: 'clamp',
    });

    return (<Animated.View style={[styles.viewTabbar, { transform: [{ translateY: navbarTranslate }] }]} />);
  }

  render() {

    return (
      <SafeAreaView flex={1}>
        <View flex={1} backgroundColor={'white'}>
          <Animated.ScrollView
            ref={ref => (this._scrollView = ref)}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: this.state.scrollAnim } } }],
              {
                listener: () => {
                  this.autocompleteDebounced();
                },
                useNativeDriver: false,
              },
            )}
            scrollEventThrottle={16}
            onMomentumScrollEnd={() => this.autocompleteDebounced()}
            onScrollEndDrag={() => this.autocompleteDebounced()}
          >
            {[{}, {}, {}, {}, {}, {}, {}, {}, {}, {}].map(this.renderItem)}

          </Animated.ScrollView>
        </View>
        {this.renderTabbar()}
      </SafeAreaView>
    );

  }
}

const styles = StyleSheet.create({
  viewTabbar: {
    height: 50,
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#ffe0cc',
  },
});