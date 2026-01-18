import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { MainTabs } from './MainTabs';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { ViewAllScreen } from '../screens/ViewAllScreen';
import { IPOScreen } from '../screens/IPOScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { FOScreen } from '../screens/FOScreen';
import { AllStocksScreen } from '../screens/AllStocksScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
                <Stack.Screen name="ViewAll" component={ViewAllScreen} />
                <Stack.Screen name="IPO" component={IPOScreen} />
                <Stack.Screen name="Events" component={EventsScreen} />
                <Stack.Screen name="FO" component={FOScreen} />
                <Stack.Screen name="AllStocks" component={AllStocksScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
