DROP INDEX "unique_analytics_country";--> statement-breakpoint
DROP INDEX "unique_analytics_device";--> statement-breakpoint
DROP INDEX "unique_analytics_os";--> statement-breakpoint
DROP INDEX "unique_analytics_route";--> statement-breakpoint
DROP INDEX "unique_analytics_source";--> statement-breakpoint
ALTER TABLE "countryAnalytics" ADD COLUMN "date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "deviceAnalytics" ADD COLUMN "date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "osAnalytics" ADD COLUMN "date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "routeAnalytics" ADD COLUMN "date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "sourceAnalytics" ADD COLUMN "date" date NOT NULL;--> statement-breakpoint
CREATE INDEX "country_analytics_date_idx" ON "countryAnalytics" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_analytics_country_date" ON "countryAnalytics" USING btree ("analyticsId","countryCode","date");--> statement-breakpoint
CREATE INDEX "device_analytics_date_idx" ON "deviceAnalytics" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_analytics_device_date" ON "deviceAnalytics" USING btree ("analyticsId","deviceType","date");--> statement-breakpoint
CREATE INDEX "os_analytics_date_idx" ON "osAnalytics" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_analytics_os_date" ON "osAnalytics" USING btree ("analyticsId","osName","date");--> statement-breakpoint
CREATE INDEX "route_analytics_date_idx" ON "routeAnalytics" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_analytics_route_date" ON "routeAnalytics" USING btree ("analyticsId","route","date");--> statement-breakpoint
CREATE INDEX "source_analytics_date_idx" ON "sourceAnalytics" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_analytics_source_date" ON "sourceAnalytics" USING btree ("analyticsId","sourceName","date");