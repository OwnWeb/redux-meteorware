/* eslint no-unused-expressions: 0 */
/* global Computation, Tracker, afterEach, beforeEach, describe, it, expect, sinon */
import {meteorDatasource, actionTypeBuilder} from "meteor/shawnmclean:redux-meteorware";

describe('meteorDatasource', () => {
    const store = {
        dispatch: sinon.spy(),
    };

    const get = sinon.stub().returns('foo');
    const onChange = sinon.stub();

    const next = sinon.spy();
    const Computation = sinon.stub(Tracker, 'autorun')
    beforeEach(() => {
        next.reset();
        get.reset();
        Tracker.autorun.reset();
        Computation.stop.reset();
    });

    it('should call next if action does not have a meteor property', () => {
        const action = { type: 'dummy_datasource' };
        meteorDatasource(store)(next)(action);

        expect(next).to.have.been.calledWith(action);
    });

    it('should call next if action have a meteor.subscribe property', () => {
        const action = { type: 'dummy_datasource_1', meteor: { subscribe: true } };
        meteorDatasource(store)(next)(action);

        expect(next).to.have.been.calledWith(action);
    });

    it('should call the Tracker autorun method once', () => {
        const action = { type: 'dummy_datasource_2', meteor: {
        get,
        }};

        meteorDatasource(store)(next)(action);

        expect(Tracker.autorun).to.have.been.calledOnce;
    });

    it('should call the Tracker computation stop method once if action has been dispatched twice with the same type', () => {
        const action = { type: 'dummy_datasource_3', meteor: {
        get,
        }};

        meteorDatasource(store)(next)(action);
        meteorDatasource(store)(next)(action);

        expect(Computation.stop).to.have.been.calledOnce;
    });

    it('should call action.meteor.get()', () => {
        const action = { type: 'dummy_datasource_4', meteor: {
        get,
        }};

        meteorDatasource(store)(next)(action);

        expect(action.meteor.get).to.have.been.called;
    });

    it('should call action.meteor.onChange() if defined, with data returned from action.meteor.get', () => {
        const action = { type: 'dummy_datasource_4', meteor: {
        get,
        onChange,
        }};

        meteorDatasource(store)(next)(action);

        expect(action.meteor.onChange).to.have.been.calledWith('foo');
    });

    it('should call dispatch an changed action immediatly', () => {
        const action = { type: 'dummy_datasource_5', meteor: {
        get,
        }};

        meteorDatasource(store)(next)(action);

        expect(store.dispatch).to.have.been.calledWith({
        type: actionTypeBuilder.changed('dummy_datasource_5'),
        data: 'foo',
        });
    });
});