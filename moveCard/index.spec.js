"use strict";

const { sinon, proxyquire } = testHelpers;

describe( "moveCard", () => {
	let github, apiFactory, moveCard, getInputParams, validateLeankitUrl, reportError;
	function init() {
		github = {
			context: {
				payload: {}
			}
		};

		getInputParams = sinon.stub().returns( [
			"HOST",
			"API_TOKEN",
			"CARDID",
			"LANEID",
			"WIPOVERRIDE"
		] )
		reportError = sinon.stub();
		validateLeankitUrl = sinon.stub();
		moveCard = sinon.stub();
		apiFactory = sinon.stub().returns( {
			moveCard
		} );
	}

	function action() {
		return proxyquire( "~/moveCard", {
			"../leankit/api": apiFactory,
			"../leankit/helpers": {
				getInputParams,
				reportError,
				validateLeankitUrl
			}
		} );
	}

	describe( "validation", () => {
		describe( "when validation fails", () => {
			const error = new Error( "Input required and not supplied: SOME PARAM" );
			beforeEach( async () => {
				init();
				getInputParams.throws( error );
				await action();
			} );

			it( "should validate params", () => {
				getInputParams.should.be.calledOnce.and.calledWith({
					required: [
						"host",
						"apiToken",
						"cardId",
						"laneId"
					],
					optional: [
						"wipOverrideComment"
					]
				} );
			} );

			it( "should report error", async () => {
				reportError.should.be.calledOnce.and.calledWith( "moveCard", error );
			} );
		} );

		describe( "with invalid host", () => {
			const error = new Error( "Expected a leankit url for 'host' action parameter" );
			beforeEach( async () => {
				init();
				getInputParams.returns( [ "INVALID_HOST" ] );
				validateLeankitUrl.throws( error )
				await action();
			} );

			it( "should validate host param", () => {
				validateLeankitUrl.should.be.calledOnce.and.calledWith( "host", "INVALID_HOST");
			} );

			it( "should report error", () => {
				reportError.should.be.calledOnce.and.calledWith( "moveCard", error );
			} );
		} );
	} );

	describe( "with valid parameters", () => {
		beforeEach( async () => {
			init();
			await action();
		} );

		it( "should get leankit api", () => {
			apiFactory.should.be.calledOnce.and.calledWith( "HOST", "API_TOKEN" );
		} );

		it( "should move card to expected lane", () => {
			moveCard.should.be.calledOnce.and.calledWith( "CARDID", "LANEID", "WIPOVERRIDE" );
		} );
	} );
} );
