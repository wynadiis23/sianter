import { Elysia } from 'elysia'
import { TrackingService } from './service'
import { TrackingModel } from './model'

export const trackingModule = new Elysia({ prefix: '/api/track' })
  .get('/:token', ({ params }) => TrackingService.getByToken(params.token), {
    response: {
      200: TrackingModel.trackResponse,
      404: TrackingModel.notFound,
    },
  })
