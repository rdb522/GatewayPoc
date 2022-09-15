#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GatewayPocStack } from '../services/GatewayPoc';

const app = new cdk.App();
new GatewayPocStack(app, 'GatewayPocStack', {});