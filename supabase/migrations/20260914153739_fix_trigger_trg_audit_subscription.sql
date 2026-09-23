CREATE OR REPLACE TRIGGER trg_audit_subscriptions
AFTER INSERT OR UPDATE OR DELETE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION fn_log_audit('subscriptions');
