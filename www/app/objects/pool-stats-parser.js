import Ember from 'ember';

export default Ember.Object.extend({
    globals: Ember.inject.service('globals'),
    config: Ember.computed.reads('globals.config'),  
    
    data: null,            

    bestNode: Ember.computed('data.nodes', function() {
        var node = null,
            nodes = this.get('data.nodes');
        
        if (nodes) {
            nodes.forEach(function (n) {
                if (!node) {
                    node = n;
                } else if (n.height > node.height) {
                    node = n;
                }
            });
        }

        return node;           
    }),

    blockchainHeight: Ember.computed('bestNode', function() {     
        var height = 0,
            node = this.get('bestNode');

        if (node) {
            height = node.height;
        }

        return height;
    }),

    difficulty: Ember.computed('bestNode', function() {
        var difficulty = 0,
            node = this.get('bestNode');

        if (node) {
            difficulty = node.difficulty;
        }

        return difficulty;
    }),    

    networkHashrate: Ember.computed('difficulty', 'config.BlockTime', function() {        
        var networkHashRate = 0;
        
        networkHashRate = this.getWithDefault('difficulty', 0) / this.getWithDefault('config.BlockTime', 1);

        return networkHashRate;                    
    }),

    epochDate: Ember.computed('blockchainHeight', 'config.BlockTime', 'config.EpochBlockCount', function() {
        var blockchainHeight = this.get('blockchainHeight'),
            blockTime = this.get('config.BlockTime'),
            epochBlockCount = this.get('config.EpochBlockCount'),
            epochOffset,
            epochDate;
        
        epochOffset = (epochBlockCount - (blockchainHeight % epochBlockCount)) * 1000 * blockTime;
        epochDate = Date.now() + epochOffset;     

        return epochDate;            
    }),   
    
    newBlocks: Ember.computed('data.immatureTotal', 'data.candidatesTotal', function() {
        return this.get('data.immatureTotal') + this.get('data.candidatesTotal');
    }),

    roundVariance: Ember.computed('difficulty', 'data.stats.roundShares', function() {        
        var percent = this.get('data.stats.roundShares') / this.getWithDefault('difficulty', 1);

        if (!percent) {
            percent = 0;
        }

        return percent.toFixed(2);                            
    }),

    poolStats: Ember.computed('config.PayoutThreshold', 'config.PoolFee', 'data.minersTotal', 'data.hashrate', 'data.stats.lastBlockFound', 'data.stats.roundShares', 'roundVariance', 'newBlocks', function() {
        return {
            payoutThreshold: this.getWithDefault('config.PayoutThreshold', 0),
            poolFee: this.getWithDefault('config.PoolFee', 0),
            minersOnline: this.getWithDefault('data.minersTotal', 0),
            hashrate: this.getWithDefault('data.hashrate', 0),
            lastBlockFound: this.getWithDefault('data.stats.lastBlockFound', 0),
            newBlocks: this.getWithDefault('newBlocks', 0),
            roundShares: this.getWithDefault('data.stats.roundShares', 0),
            roundVariance: this.getWithDefault('roundVariance', 0)
        };
    }),

    networkStats: Ember.computed('difficulty', 'networkHashrate', 'blockchainHeight', 'epochDate', function() {
        return {
            difficulty: this.getWithDefault('difficulty', 0),
            hashrate: this.getWithDefault('networkHashrate', 0),
            blockchainHeight: this.getWithDefault('blockchainHeight', 0),
            epochDate: this.getWithDefault('epochDate', 0)
        };
    })
});